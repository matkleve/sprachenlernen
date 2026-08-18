import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  createLearnerTextSource,
  findLearnerSourceById,
  listLearnerSourcesForLanguage,
  rowToSource,
} from "@/lib/db/content-sources";

/**
 * Offline adapter coverage. RLS is proven in lib/db/access-control.test.ts.
 * Contract: docs/specs/feature/word-capture.md
 */

function authForUser(user: { id: string; email: string } | null) {
  const session = user ? { user } : null;
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session } }),
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  };
}

function sourcesClient(options: {
  userId: string | null;
  insert?: { data: Record<string, unknown> | null; error: { message: string; code?: string } | null };
  selectOne?: { data: Record<string, unknown> | null; error: { message: string } | null };
  selectMany?: { data: Record<string, unknown>[] | null; error: { message: string } | null };
}) {
  const insert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(
        options.insert ?? {
          data: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            user_id: options.userId,
            language_code: "es",
            kind: "text",
            title: "Hola",
            body: "Hola mundo.",
            transcript: null,
            tags: null,
            source_url: null,
            added_at: "2026-08-18T12:00:00.000Z",
          },
          error: null,
        },
      ),
    }),
  });

  const select = vi.fn().mockImplementation(() => ({
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(
      options.selectMany ?? {
        data: [
          {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            user_id: options.userId,
            language_code: "es",
            kind: "text",
            title: "Saved",
            body: "Texto guardado.",
            transcript: null,
            tags: null,
            source_url: null,
            added_at: "2026-08-18T12:00:00.000Z",
          },
        ],
        error: null,
      },
    ),
    maybeSingle: vi.fn().mockResolvedValue(
      options.selectOne ?? {
        data: {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          user_id: options.userId,
          language_code: "es",
          kind: "text",
          title: "Hola",
          body: "Hola mundo.",
          transcript: null,
          tags: null,
          source_url: null,
          added_at: "2026-08-18T12:00:00.000Z",
        },
        error: null,
      },
    ),
  }));

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "content_sources") return { insert, select };
    throw new Error(`unexpected table ${table}`);
  });

  return {
    auth: authForUser(
      options.userId ? { id: options.userId, email: "a@example.com" } : null,
    ),
    from,
    insert,
  } as unknown as SupabaseClient & { insert: ReturnType<typeof vi.fn> };
}

describe("rowToSource", () => {
  it("maps a learner text row to a persisted Source", () => {
    const source = rowToSource({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      language_code: "es",
      kind: "text",
      title: "Mi texto",
      body: "Hola mundo.",
      transcript: null,
      tags: ["news"],
      source_url: null,
      added_at: "2026-08-18T12:00:00.000Z",
    });

    expect(source).toMatchObject({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      languageCode: "es",
      origin: "learner",
      ephemeral: false,
      tags: ["news"],
    });
  });
});

describe("createLearnerTextSource", () => {
  it("AC-1: persists pasted text when keep in library", async () => {
    const client = sourcesClient({ userId: "user-1" });

    const result = await createLearnerTextSource(
      { languageCode: "es", body: "Hola mundo.", title: "Hola" },
      client,
    );

    expect(result).toEqual({
      status: "ok",
      source: expect.objectContaining({
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        origin: "learner",
        ephemeral: false,
        body: "Hola mundo.",
      }),
    });
    expect(client.insert).toHaveBeenCalled();
  });

  it("requires sign-in to persist", async () => {
    const client = sourcesClient({ userId: null });

    const result = await createLearnerTextSource(
      { languageCode: "es", body: "Hola mundo." },
      client,
    );

    expect(result.status).toBe("error");
  });
});

describe("listLearnerSourcesForLanguage", () => {
  it("AC-2: lists saved learner sources for the active language", async () => {
    const client = sourcesClient({ userId: "user-1" });

    const result = await listLearnerSourcesForLanguage("es", client);

    expect(result).toEqual({
      status: "ok",
      sources: [
        expect.objectContaining({
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          origin: "learner",
          ephemeral: false,
        }),
      ],
    });
  });
});

describe("findLearnerSourceById", () => {
  it("returns a saved source by id", async () => {
    const client = sourcesClient({ userId: "user-1" });

    const result = await findLearnerSourceById(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      client,
    );

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.source?.body).toBe("Hola mundo.");
  });
});
