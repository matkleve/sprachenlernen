import { describe, expect, it, vi } from "vitest";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { listLearningLanguages } from "@/lib/db/learning-languages";

/** Contract: docs/specs/service/learning-languages.md */

vi.mock("@/lib/db/learning-languages", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/learning-languages")>()),
  listLearningLanguages: vi.fn(),
}));

const language = (code: string, isActive: boolean) => ({
  languageCode: code,
  isActive,
  addedAt: "2026-08-11T10:00:00.000Z",
});

const learning = (...languages: ReturnType<typeof language>[]) =>
  vi.mocked(listLearningLanguages).mockResolvedValue({ status: "ok", languages });

describe("poolForActiveLanguage", () => {
  it("returns only the language in focus, never any other learning language", async () => {
    // The whole point (UC-025, corrected 2026-08-12): a session and the screen
    // now always agree on exactly one language. "xx" below has no shipped pool
    // and must not even be attempted, let alone appear in the result.
    learning(language("es", true), language("xx", false));

    const pool = await poolForActiveLanguage();

    expect(pool.status).toBe("ok");
    if (pool.status !== "ok") return;
    expect(pool.languageCodes).toEqual(["es"]);
    expect(pool.cards.every((card) => card.taskId.startsWith("es:"))).toBe(true);
    expect(pool.cards.some((card) => card.taskId.endsWith(":form-recall"))).toBe(true);
    expect(pool.cards.some((card) => card.taskId.endsWith(":meaning-recall"))).toBe(true);
  });

  it("reports no-language when nothing is in focus, even with languages present", async () => {
    // A row set with no active row is recoverable state, not a display.
    learning(language("es", false));

    expect(await poolForActiveLanguage()).toEqual({ status: "no-language" });
  });

  it("reports no-language rather than an empty pool when there are no rows", async () => {
    learning();

    expect(await poolForActiveLanguage()).toEqual({ status: "no-language" });
  });

  it("errors when the language in focus has no shipped pool", async () => {
    learning(language("xx", true));

    expect((await poolForActiveLanguage()).status).toBe("error");
  });

  it("passes a read failure through", async () => {
    vi.mocked(listLearningLanguages).mockResolvedValue({ status: "error", error: "boom" });

    expect((await poolForActiveLanguage()).status).toBe("error");
  });
});
