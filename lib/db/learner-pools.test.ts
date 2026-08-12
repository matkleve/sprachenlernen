import { describe, expect, it, vi } from "vitest";

import { poolForDisplay, poolForScheduling } from "@/lib/db/learner-pools";
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

describe("poolForScheduling", () => {
  it("includes a language that is not in focus", async () => {
    // The whole point. UC-025 splits one daily budget across every language
    // being learned; if scheduling followed the interface, the language you
    // are not looking at would stop being reviewed and decay.
    learning(language("xx", true), language("es", false));

    const pool = await poolForScheduling();

    expect(pool.status).toBe("ok");
    if (pool.status !== "ok") return;
    expect(pool.languageCodes).toContain("es");
    expect(pool.cards.length).toBeGreaterThan(0);
  });

  it("reports no-language rather than an empty pool", async () => {
    learning();

    expect(await poolForScheduling()).toEqual({ status: "no-language" });
  });

  it("skips a language whose pool no longer ships instead of failing", async () => {
    // One broken deck must not cost the learner the languages that still work.
    learning(language("es", true), language("xx", false));

    const pool = await poolForScheduling();

    expect(pool.status).toBe("ok");
    if (pool.status !== "ok") return;
    expect(pool.languageCodes).toEqual(["es"]);
  });

  it("errors when no language it holds has a pool", async () => {
    learning(language("xx", true));

    expect((await poolForScheduling()).status).toBe("error");
  });

  it("passes a read failure through", async () => {
    vi.mocked(listLearningLanguages).mockResolvedValue({ status: "error", error: "boom" });

    expect((await poolForScheduling()).status).toBe("error");
  });
});

describe("poolForDisplay", () => {
  it("returns only the language in focus", async () => {
    learning(language("es", true), language("xx", false));

    const pool = await poolForDisplay();

    expect(pool.status).toBe("ok");
    if (pool.status !== "ok") return;
    expect(pool.languageCodes).toEqual(["es"]);
    expect(pool.cards.some((card) => card.taskId.endsWith(":form-recall"))).toBe(true);
    expect(pool.cards.some((card) => card.taskId.endsWith(":meaning-recall"))).toBe(true);
  });

  it("reports no-language when nothing is in focus, even with languages present", async () => {
    // A row set with no active row is recoverable state, not a display.
    learning(language("es", false));

    expect(await poolForDisplay()).toEqual({ status: "no-language" });
  });

  it("errors when the language in focus has no pool", async () => {
    learning(language("xx", true));

    expect((await poolForDisplay()).status).toBe("error");
  });
});
