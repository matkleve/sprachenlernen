import { beforeEach, describe, expect, it, vi } from "vitest";

import { readPicker } from "@/features/language-picker/reading";
import { listLearningLanguages } from "@/lib/db/learning-languages";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import {
  loadSpanishMeaningRecallDeck,
  SHIPPED_ES_POOL_SIZE,
  SHIPPED_IT_POOL_SIZE,
} from "@/lib/starter-deck";

/** Contract: docs/specs/page/language-picker.md */

vi.mock("@/lib/db/learning-languages", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/learning-languages")>()),
  listLearningLanguages: vi.fn(),
}));

vi.mock("@/lib/db/review-log", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/review-log")>()),
  listReviewsForTaskIds: vi.fn(),
}));

const spanishDeck = loadSpanishMeaningRecallDeck();
const firstCard = spanishDeck.status === "ok" ? spanishDeck.deck.cards[0]! : null;

beforeEach(() => {
  vi.mocked(listLearningLanguages).mockResolvedValue({ status: "ok", languages: [] });
  vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });
});

describe("readPicker", () => {
  it("returns null heldCount when the learner has not reviewed in a language", async () => {
    const outcome = await readPicker();

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;

    const spanish = outcome.tiles.find((tile) => tile.code === "es");
    expect(spanish?.poolSize).toBe(SHIPPED_ES_POOL_SIZE);
    expect(spanish?.heldCount).toBeNull();

    const italian = outcome.tiles.find((tile) => tile.code === "it");
    expect(italian?.poolSize).toBe(SHIPPED_IT_POOL_SIZE);
    expect(italian?.heldCount).toBeNull();
  });

  it("returns a held count once meaning-recall history exists", async () => {
    if (!firstCard) throw new Error("spanish deck missing in test setup");

    vi.mocked(listReviewsForTaskIds).mockResolvedValue({
      status: "ok",
      reviews: [
        {
          id: "row-1",
          userId: "user-1",
          installationId: "11111111-1111-4111-8111-111111111111",
          taskId: firstCard.taskId,
          grade: "easy",
          reviewedAt: new Date().toISOString(),
          latencyMs: 1000,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const outcome = await readPicker();

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;

    const spanish = outcome.tiles.find((tile) => tile.code === "es");
    expect(spanish?.heldCount).toBeGreaterThanOrEqual(0);
    expect(spanish?.heldCount).toBeLessThanOrEqual(SHIPPED_ES_POOL_SIZE);
  });

  it("passes through a review-log failure", async () => {
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({
      status: "error",
      error: "Not signed in.",
    });

    expect(await readPicker()).toEqual({ status: "error", error: "Not signed in." });
  });

  it("marks the active language on each tile", async () => {
    vi.mocked(listLearningLanguages).mockResolvedValue({
      status: "ok",
      languages: [
        {
          languageCode: "es",
          isActive: true,
          addedAt: "2026-08-11T10:00:00.000Z",
        },
      ],
    });

    const outcome = await readPicker();

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;

    expect(outcome.tiles.find((tile) => tile.code === "es")?.isActive).toBe(true);
    expect(outcome.tiles.find((tile) => tile.code === "it")?.isActive).toBe(false);
  });
});
