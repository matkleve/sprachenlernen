import { describe, expect, it } from "vitest";

import { removeReportedCardFromQueue } from "@/features/review-session/remove-reported-card";
import type { SessionCard } from "@/lib/session-builder";

function card(wordId: string, front: string, position: number, total: number): SessionCard {
  return {
    wordId,
    taskId: `${wordId}:meaning-recall`,
    lemma: front,
    front,
    back: "back",
    descriptionKey: `${wordId}:en`,
    frequencyRank: position,
    position,
    total,
  };
}

describe("removeReportedCardFromQueue", () => {
  it("removes the active card and advances to the next queue item", () => {
    const queue = [card("es:a", "a", 1, 3), card("es:b", "b", 2, 3), card("es:c", "c", 3, 3)];
    const { queue: nextQueue, nextIndex } = removeReportedCardFromQueue(queue, 0, "es:a");

    expect(nextIndex).toBe(0);
    expect(nextQueue.map((item) => item.front)).toEqual(["b", "c"]);
    expect(nextQueue[0]).toMatchObject({ position: 1, total: 2 });
  });

  it("removes every copy of the reported word, including a requeued one", () => {
    const queue = [
      card("es:a", "a", 1, 4),
      card("es:b", "b", 2, 4),
      card("es:a", "a", 3, 4),
      card("es:c", "c", 4, 4),
    ];
    const { queue: nextQueue, nextIndex } = removeReportedCardFromQueue(queue, 2, "es:a");

    expect(nextIndex).toBe(1);
    expect(nextQueue.map((item) => item.front)).toEqual(["b", "c"]);
    expect(nextQueue[1]?.front).toBe("c");
  });

  it("signals session completion when the reported card was last", () => {
    const queue = [card("es:a", "a", 1, 1)];
    const { queue: nextQueue, nextIndex } = removeReportedCardFromQueue(queue, 0, "es:a");

    expect(nextQueue).toEqual([]);
    expect(nextIndex).toBe(0);
  });
});
