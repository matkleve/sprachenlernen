import { describe, expect, it } from "vitest";

import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
import { buildSession, DEFAULT_SESSION_LENGTH } from "@/lib/session-builder";
import { applyReview, newTask } from "@/lib/scheduler";

const pool = loadSpanishMeaningRecallDeck();
const cards = pool.status === "ok" ? pool.deck.cards : [];

describe("session-builder", () => {
  it("returns 15 cards in frequency order with no history", () => {
    const session = buildSession(cards, {}, Date.now());
    expect(session).toHaveLength(DEFAULT_SESSION_LENGTH);
    expect(session[0]?.lemma).toBe("el");
    expect(session[14]?.frequencyRank).toBe(15);
    expect(session[0]?.position).toBe(1);
    expect(session[0]?.total).toBe(DEFAULT_SESSION_LENGTH);
  });

  it("prioritises due tasks before new ones", () => {
    const dueCard = cards[0]!;
    const freshCard = cards[1]!;
    const reviewedAt = Date.now() - 14 * 86_400_000;
    let task = newTask(dueCard.taskId, dueCard.wordId);
    task = applyReview(task, "good", reviewedAt).task;
    task = applyReview(task, "good", reviewedAt + 86_400_000).task;
    const now = task.due + 1;

    const session = buildSession(
      [freshCard, dueCard],
      { [dueCard.taskId]: task },
      now,
    );
    expect(session[0]?.taskId).toBe(dueCard.taskId);
  });

  it("returns every card when the pool is smaller than the session length", () => {
    const tiny = cards.slice(0, 10);
    const session = buildSession(tiny, {}, Date.now(), DEFAULT_SESSION_LENGTH);
    expect(session).toHaveLength(10);
  });
});
