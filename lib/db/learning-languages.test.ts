import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  activeLanguageOf,
  addLearningLanguage,
  languagesWithAPool,
  listLearningLanguages,
  setActiveLanguage,
} from "@/lib/db/learning-languages";

/**
 * Offline adapter coverage. RLS for `learner_language` — including the UPDATE
 * surface this table is the first to grant — is proven against the live project
 * in lib/db/access-control.test.ts, which skips without the three Supabase
 * secrets. Behaviour below is the adapter's, not the policy's.
 */

type Row = { language_code: string; is_active: boolean; added_at: string };

const row = (code: string, isActive = false, addedAt = "2026-08-11T10:00:00.000Z"): Row => ({
  language_code: code,
  is_active: isActive,
  added_at: addedAt,
});

function client(options: {
  rows?: Row[];
  signedIn?: boolean;
  selectError?: { message: string };
  insertError?: { message: string };
  updateError?: { message: string };
  /** What the promotion says it touched — [] is "the target vanished". */
  promotedRows?: { language_code: string }[];
}) {
  const { rows = [], signedIn = true } = options;
  const inserted: Record<string, unknown>[] = [];
  const updates: { values: Record<string, unknown>; filters: [string, unknown][] }[] = [];

  const order = vi.fn().mockResolvedValue({
    data: options.selectError ? null : rows,
    error: options.selectError ?? null,
  });

  // `.update().eq().eq()` may be awaited directly (the clear) or finished with
  // `.select()` (the promotion, which has to know how many rows it touched).
  const update = vi.fn().mockImplementation((values: Record<string, unknown>) => {
    const filters: [string, unknown][] = [];
    const settle = () => {
      updates.push({ values, filters });
      const promoted = options.promotedRows ?? [{ language_code: "x" }];
      return { data: promoted, error: options.updateError ?? null };
    };
    const chain = {
      eq: vi.fn().mockImplementation((column: string, value: unknown) => {
        filters.push([column, value]);
        return chain;
      }),
      select: vi.fn().mockImplementation(() => Promise.resolve(settle())),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(settle()).then(resolve),
    };
    return chain;
  });

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: signedIn ? { id: "user-1", email: "a@example.com" } : null },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ order }),
      insert: vi.fn().mockImplementation((values: Record<string, unknown>) => {
        inserted.push(values);
        return Promise.resolve({ error: options.insertError ?? null });
      }),
      update,
    }),
  } as unknown as SupabaseClient;

  return { supabase, inserted, updates };
}

describe("learning-languages", () => {
  it("returns an empty list, not an error, when nothing is chosen yet", async () => {
    // A learner who has not chosen is not a failure. Collapsing the two sends
    // someone who is signed in and learning back to the picker.
    const { supabase } = client({ rows: [] });

    const outcome = await listLearningLanguages(supabase);

    expect(outcome).toEqual({ status: "ok", languages: [] });
  });

  it("refuses when there is no session", async () => {
    const { supabase } = client({ signedIn: false });

    const outcome = await listLearningLanguages(supabase);

    expect(outcome.status).toBe("error");
  });

  it("returns an error, never an empty list, when the read fails", async () => {
    const { supabase } = client({ selectError: { message: "boom" } });

    const outcome = await listLearningLanguages(supabase);

    expect(outcome.status).toBe("error");
  });

  it("makes the first language active", async () => {
    const { supabase, inserted } = client({ rows: [] });

    await addLearningLanguage("es", supabase);

    expect(inserted[0]).toMatchObject({ language_code: "es", is_active: true });
  });

  it("adding is not switching — a later language never steals focus", async () => {
    // The account already learns something else and it is active. Adding an
    // available language must insert it inactive. (The pre-existing row uses a
    // code with no shipped pool on purpose: only `es` is available today, so
    // this is the only way to have two rows at all.)
    const { supabase, inserted } = client({ rows: [row("xx", true)] });

    await addLearningLanguage("es", supabase);

    expect(inserted[0]).toMatchObject({ language_code: "es", is_active: false });
  });

  it("is idempotent when the language is already there", async () => {
    const { supabase, inserted } = client({ rows: [row("es", true)] });

    const outcome = await addLearningLanguage("es", supabase);

    expect(outcome).toEqual({ status: "ok" });
    expect(inserted).toEqual([]);
  });

  it("refuses a language that ships no pool, naming it", async () => {
    const { supabase, inserted } = client({ rows: [] });

    const outcome = await addLearningLanguage("it", supabase);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error).toContain("it");
    expect(inserted).toEqual([]);
  });

  it("clears the old active row before setting the new one", async () => {
    // The partial unique index rejects the reverse order, so ordering is a
    // correctness property, not tidiness.
    const { supabase, updates } = client({ rows: [row("es", true), row("xx")] });

    const outcome = await setActiveLanguage("xx", supabase);

    expect(outcome).toEqual({ status: "ok" });
    expect(updates[0]?.values).toEqual({ is_active: false });
    expect(updates[1]?.values).toEqual({ is_active: true });
  });

  it("does nothing when the language is already in focus", async () => {
    const { supabase, updates } = client({ rows: [row("es", true)] });

    const outcome = await setActiveLanguage("es", supabase);

    expect(outcome).toEqual({ status: "ok" });
    expect(updates).toEqual([]);
  });

  it("refuses a language the account does not have, before clearing anything", async () => {
    // The old version cleared first and returned "ok" when the target matched
    // nothing, leaving the account with languages and none in focus.
    const { supabase, updates } = client({ rows: [row("es", true)] });

    const outcome = await setActiveLanguage("zz", supabase);

    expect(outcome.status).toBe("error");
    expect(updates).toEqual([]);
  });

  it("puts the previous language back when the promotion touches nothing", async () => {
    const { supabase, updates } = client({ rows: [row("es", true), row("xx")], promotedRows: [] });

    const outcome = await setActiveLanguage("xx", supabase);

    expect(outcome.status).toBe("error");
    // clear → failed promote → restore, so the account is never left with none.
    expect(updates).toHaveLength(3);
    expect(updates[2]?.values).toEqual({ is_active: true });
    expect(updates[2]?.filters).toContainEqual(["language_code", "es"]);
  });

  it("derives availability from the shipped pools", () => {
    expect(languagesWithAPool()).toContain("es");
    // Italian data ships, but no pool can be built from it yet.
    expect(languagesWithAPool()).not.toContain("it");
  });

  it("reads the active language out of a list", () => {
    expect(activeLanguageOf([row("es", false), row("fr", true)].map((r) => ({
      languageCode: r.language_code,
      isActive: r.is_active,
      addedAt: r.added_at,
    })))).toBe("fr");
    expect(activeLanguageOf([])).toBeNull();
  });

  it("never lets the active language reach the session builder", () => {
    // The damage is silent and an absent import is not something a reviewer
    // notices, so the absence is asserted. If scheduling ever follows the
    // interface's focus, the language not being looked at stops being reviewed
    // and decays — the whole failure UC-025 prevents.
    //
    // The likelier violation is not an import here but a *caller* pre-filtering
    // the pool, so the review-session action is checked too.
    const builder = readFileSync(join(process.cwd(), "lib/session-builder.ts"), "utf8");
    expect(builder).not.toMatch(/learning-languages|activeLanguage|isActive/);

    // `buildSession(pool, reviews, now, length)` — a fifth argument, or a named
    // language parameter, is how the coupling would arrive.
    expect(builder).not.toMatch(/language/i);

    const caller = readFileSync(
      join(process.cwd(), "features/review-session/actions.ts"),
      "utf8",
    );
    expect(caller).not.toMatch(/activeLanguageOf|learning-languages/);
  });
});
