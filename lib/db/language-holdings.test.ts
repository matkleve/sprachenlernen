import { beforeEach, describe, expect, it, vi } from "vitest";

import { readLanguageHoldings } from "@/lib/db/language-holdings";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { loadSpanishMeaningRecallDeck, SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

/** Contract: docs/specs/page/language-picker.md */

vi.mock("@/lib/db/review-log", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/review-log")>()),
  listReviewsForTaskIds: vi.fn(),
}));

const spanishDeck = loadSpanishMeaningRecallDeck();
const firstCard = spanishDeck.status === "ok" ? spanishDeck.deck.cards[0]! : null;

beforeEach(() => {
  vi.mocked(listReviewsForTaskIds).mockClear();
  vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });
});

describe("readLanguageHoldings", () => {
  it("returns null heldCount before any review in a language", async () => {
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });

    const outcome = await readLanguageHoldings(["es"]);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.byCode.es?.poolSize).toBe(SHIPPED_ES_POOL_SIZE);
    expect(outcome.byCode.es?.heldCount).toBeNull();
  });

  it("returns a held count after meaning-recall reviews exist", async () => {
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

    const outcome = await readLanguageHoldings(["es"]);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.byCode.es?.heldCount).toBeGreaterThanOrEqual(0);
  });

  it("batches one review-log read across languages", async () => {
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });

    await readLanguageHoldings(["es", "it"]);

    expect(listReviewsForTaskIds).toHaveBeenCalledTimes(1);
  });
});
