import { describe, expect, it, vi } from "vitest";

import { createLearnerTextSource } from "@/lib/db/content-sources";
import { LEARNER_SOURCE_MAX_BODY_CHARS } from "@/lib/learner-text-limits";
import * as auth from "@/lib/db/auth";

/**
 * Contract: docs/specs/feature/word-capture.md § Data.
 *
 * The cookie path refuses over 3500 chars because a cookie cannot carry more.
 * The database path had no ceiling at all, so one signed-in account could
 * write rows of unbounded size — and every read of that row afterwards hands
 * the coverage tokeniser the whole thing.
 */
describe("createLearnerTextSource — size ceiling", () => {
  it("refuses a body over the ceiling before it reaches the database", async () => {
    vi.spyOn(auth, "getAccount").mockResolvedValue({
      id: "user-1",
      email: "a@example.com",
    });

    const insert = vi.fn();
    const client = { from: vi.fn(() => ({ insert })) };

    const result = await createLearnerTextSource(
      {
        languageCode: "es",
        body: "a".repeat(LEARNER_SOURCE_MAX_BODY_CHARS + 1),
      },
      client as never,
    );

    expect(result.status).toBe("error");
    expect(result).toHaveProperty("error", expect.stringContaining("too long"));
    expect(insert).not.toHaveBeenCalled();
  });

  it("accepts a body exactly at the ceiling — the boundary is inclusive", async () => {
    vi.spyOn(auth, "getAccount").mockResolvedValue({
      id: "user-1",
      email: "a@example.com",
    });

    const single = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        language_code: "es",
        kind: "text",
        title: "aaa",
        body: "a",
        transcript: null,
        tags: null,
        source_url: null,
        added_at: "2026-08-20T00:00:00.000Z",
      },
      error: null,
    });
    const client = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })),
      })),
    };

    const result = await createLearnerTextSource(
      {
        languageCode: "es",
        body: "a".repeat(LEARNER_SOURCE_MAX_BODY_CHARS),
      },
      client as never,
    );

    expect(result.status).toBe("ok");
    expect(single).toHaveBeenCalled();
  });
});
