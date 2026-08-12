import { describe, expect, it } from "vitest";

import { applyReview, DEFAULT_CONFIG, newTask as schedulerNewTask } from "@/lib/scheduler";
import { bucketForTask, buildVocabularySnapshot } from "@/lib/vocabulary-snapshot";
import type { StarterCard } from "@/lib/starter-deck";

const now = Date.parse("2026-08-10T12:00:00.000Z");

const cards: StarterCard[] = [
  {
    taskId: "es:de:meaning-recall",
    wordId: "es:de",
    lemma: "de",
    front: "de",
    back: "of, from",
    frequencyRank: 1,
  },
  {
    taskId: "es:que:meaning-recall",
    wordId: "es:que",
    lemma: "que",
    front: "que",
    back: "that",
    frequencyRank: 2,
  },
];

describe("buildVocabularySnapshot", () => {
  it("counts new words when there is no history", () => {
    const snapshot = buildVocabularySnapshot(cards, {}, now);
    expect(snapshot.counts).toEqual({ held: 0, shaky: 0, new: 2 });
  });

  it("classifies held and shaky from rebuilt stability", () => {
    const heldCard = cards[0]!;
    const shakyCard = cards[1]!;

    let heldTask = schedulerNewTask(heldCard.taskId, heldCard.wordId);
    heldTask = applyReview(heldTask, "easy", now - 86_400_000).task;
    heldTask = applyReview(heldTask, "good", now - 43_200_000).task;

    let shakyTask = schedulerNewTask(shakyCard.taskId, shakyCard.wordId);
    shakyTask = applyReview(shakyTask, "again", now - 3_600_000).task;

    expect(bucketForTask(heldTask)).toBe("held");
    expect(bucketForTask(shakyTask)).toBe("shaky");

    const snapshot = buildVocabularySnapshot(
      cards,
      {
        [heldCard.taskId]: heldTask,
        [shakyCard.taskId]: shakyTask,
      },
      now,
    );

    expect(snapshot.counts.held).toBe(1);
    expect(snapshot.counts.shaky).toBe(1);
    expect(snapshot.counts.new).toBe(0);
    expect(snapshot.atlas).toHaveLength(2);
  });
});

describe("bucketForTask", () => {
  it("marks unseen tasks as new", () => {
    expect(bucketForTask(schedulerNewTask("a", "b"))).toBe("new");
  });

  it("uses graduation stability as the held threshold", () => {
    const task = schedulerNewTask("a", "b");
    const reviewed = applyReview(task, "again", now).task;
    expect(bucketForTask(reviewed, DEFAULT_CONFIG)).toBe("shaky");
  });
});
