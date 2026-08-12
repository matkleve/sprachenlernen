import { describe, expect, it } from "vitest";

import { buildFrequencyBlocks, DEFAULT_FREQUENCY_BANDS } from "@/lib/frequency-blocks";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
import { applyReview, newTask } from "@/lib/scheduler";

const pool = loadSpanishMeaningRecallDeck();
const cards = pool.status === "ok" ? pool.deck.cards : [];

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 12);

describe("frequency-blocks", () => {
  it("splits the shipped 2000-lemma pool into two bands with all new when history is empty", () => {
    const blocks = buildFrequencyBlocks(cards, {});

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({
      rankStart: 1,
      rankEnd: 1000,
      poolSize: 1000,
      held: 0,
      fragile: 0,
      new: 1000,
    });
    expect(blocks[1]).toMatchObject({
      rankStart: 1001,
      rankEnd: 2000,
      poolSize: 1000,
      held: 0,
      fragile: 0,
      new: 1000,
    });
  });

  it("counts a held meaning-recall task in the correct band", () => {
    const heldCard = cards.find((card) => card.frequencyRank === 42);
    expect(heldCard).toBeDefined();
    if (!heldCard) return;

    let heldTask = newTask(heldCard.taskId, heldCard.wordId);
    heldTask = applyReview(heldTask, "easy", now - 15 * DAY).task;
    heldTask = applyReview(heldTask, "good", now - 10 * DAY).task;
    heldTask = applyReview(heldTask, "good", now - 5 * DAY).task;

    const blocks = buildFrequencyBlocks(cards, {
      [heldCard.taskId]: heldTask,
    });

    expect(blocks[0]?.held).toBe(1);
    expect(blocks[1]?.held).toBe(0);
  });

  it("does not count form-recall-only history toward a band", () => {
    const meaningCard = cards.find((card) => card.frequencyRank === 42);
    expect(meaningCard).toBeDefined();
    if (!meaningCard) return;

    const blocks = buildFrequencyBlocks([meaningCard], {});

    expect(blocks[0]).toMatchObject({ poolSize: 1, held: 0, fragile: 0, new: 1 });
  });

  it("keeps held + fragile + new equal to poolSize per band", () => {
    const blocks = buildFrequencyBlocks(cards.slice(0, 50), {});

    for (const block of blocks) {
      expect(block.held + block.fragile + block.new).toBe(block.poolSize);
    }
  });

  it("exports default bands matching the 2000-lemma pool", () => {
    expect(DEFAULT_FREQUENCY_BANDS).toEqual([
      { rankStart: 1, rankEnd: 1000 },
      { rankStart: 1001, rankEnd: 2000 },
    ]);
  });
});
