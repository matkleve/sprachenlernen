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
 * Offline adapter coverage. RLS is proven against the live project in
 * lib/db/access-control.test.ts, not here.
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
}) {
  const { rows = [], signedIn = true } = options;
  const inserted: Record<string, unknown>[] = [];
  const updates: { values: Record<string, unknown>; filters: [string, unknown][] }[] = [];

  const order = vi.fn().mockResolvedValue({
    data: options.selectError ? null : rows,
    error: options.selectError ?? null,
  });

  const update = vi.fn().mockImplementation((values: Record<string, unknown>) => {
    const filters: [string, unknown][] = [];
    const chain = {
      eq: vi.fn().mockImplementation((column: string, value: unknown) => {
        filters.push([column, value]);
        return chain;
      }),
      then: (resolve: (value: { error: null }) => unknown) => {
        updates.push({ values, filters });
        return Promise.resolve({ error: null }).then(resolve);
      },
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
    // The partial unique index rejects the reverse order, and relying on
    // statement order to satisfy a constraint breaks when two tabs switch.
    const { supabase, updates } = client({ rows: [row("es", true)] });

    await setActiveLanguage("es", supabase);

    expect(updates[0]?.values).toEqual({ is_active: false });
    expect(updates[1]?.values).toEqual({ is_active: true });
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
    // notices, so the absence is asserted. If the session builder ever filters
    // by the active language, the combined daily budget stops splitting across
    // languages and the older one decays — the whole failure UC-025 prevents.
    const source = readFileSync(join(process.cwd(), "lib/session-builder.ts"), "utf8");

    expect(source).not.toMatch(/learning-languages|activeLanguage|isActive/);
  });
});
