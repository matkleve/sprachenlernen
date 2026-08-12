import { beforeEach, describe, expect, it, vi } from "vitest";

import { readLanguageHoldings } from "@/lib/db/language-holdings";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { loadSpanishMeaningRecallDeck, SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

/** Contract: docs/specs/page/language-picker.md */

vi.mock("@/lib/db/task-state", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/task-state")>()),
  listTaskStatesForTaskIds: vi.fn(),
}));

const spanishDeck = loadSpanishMeaningRecallDeck();
const firstCard = spanishDeck.status === "ok" ? spanishDeck.deck.cards[0]! : null;

beforeEach(() => {
  vi.mocked(listTaskStatesForTaskIds).mockClear();
  vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });
});

describe("readLanguageHoldings", () => {
  it("returns null heldCount before any review in a language", async () => {
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });

    const outcome = await readLanguageHoldings(["es"]);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.byCode.es?.poolSize).toBe(SHIPPED_ES_POOL_SIZE);
    expect(outcome.byCode.es?.heldCount).toBeNull();
  });

  it("returns a held count after meaning-recall state exists", async () => {
    if (!firstCard) throw new Error("spanish deck missing in test setup");

    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({
      status: "ok",
      rows: [
        {
          taskId: firstCard.taskId,
          wordId: firstCard.wordId,
          state: "review",
          stability: 12,
          difficulty: 5,
          due: new Date().toISOString(),
          lastReviewAt: new Date().toISOString(),
          lapses: 0,
          lastGrade: "easy",
          reviewCount: 2,
          weightsVersion: "fsrs-4.5-default",
        },
      ],
    });

    const outcome = await readLanguageHoldings(["es"]);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.byCode.es?.heldCount).toBeGreaterThanOrEqual(0);
  });

  it("batches one task_state read across languages", async () => {
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });

    await readLanguageHoldings(["es", "it"]);

    expect(listTaskStatesForTaskIds).toHaveBeenCalledTimes(1);
  });
});
