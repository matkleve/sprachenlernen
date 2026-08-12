import { describe, expect, it } from "vitest";

import { applyReview, DEFAULT_CONFIG, newTask as schedulerNewTask } from "@/lib/scheduler";
import {
  bucketForTask,
  buildVocabularySnapshot,
  isTaskHeld,
  isTaskMature,
} from "@/lib/vocabulary-snapshot";
import type { StarterCard } from "@/lib/starter-deck";

const DAY = 86_400_000;
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

function spacedReviews(grades: ("again" | "hard" | "good" | "easy")[], gapDays = 5) {
  let task = schedulerNewTask("es:test:meaning-recall", "es:test");
  for (let index = 0; index < grades.length; index++) {
    const at = now - (grades.length - index) * gapDays * DAY;
    task = applyReview(task, grades[index]!, at).task;
  }
  return task;
}

describe("buildVocabularySnapshot", () => {
  it("counts new words when there is no history", () => {
    const snapshot = buildVocabularySnapshot(cards, {}, now);
    expect(snapshot.counts).toEqual({ held: 0, fragile: 0, new: 2 });
  });

  it("classifies held and fragile from rebuilt stability", () => {
    const heldCard = cards[0]!;
    const fragileCard = cards[1]!;

    let heldTask = schedulerNewTask(heldCard.taskId, heldCard.wordId);
    heldTask = applyReview(heldTask, "easy", now - 15 * DAY).task;
    heldTask = applyReview(heldTask, "good", now - 10 * DAY).task;
    heldTask = applyReview(heldTask, "good", now - 5 * DAY).task;

    let fragileTask = schedulerNewTask(fragileCard.taskId, fragileCard.wordId);
    fragileTask = applyReview(fragileTask, "again", now - 3_600_000).task;

    expect(bucketForTask(heldTask)).toBe("held");
    expect(bucketForTask(fragileTask)).toBe("fragile");

    const snapshot = buildVocabularySnapshot(
      cards,
      {
        [heldCard.taskId]: heldTask,
        [fragileCard.taskId]: fragileTask,
      },
      now,
    );

    expect(snapshot.counts.held).toBe(1);
    expect(snapshot.counts.fragile).toBe(1);
    expect(snapshot.counts.new).toBe(0);
    expect(snapshot.atlas).toHaveLength(2);
    expect(snapshot.atlas.find((point) => point.lemma === heldCard.lemma)?.mature).toBe(
      (heldTask.stability ?? 0) >= DEFAULT_CONFIG.matureStabilityThreshold,
    );
  });
});

describe("bucketForTask", () => {
  it("marks unseen tasks as new", () => {
    expect(bucketForTask(schedulerNewTask("a", "b"))).toBe("new");
  });

  it("does not count one good as held", () => {
    const task = applyReview(schedulerNewTask("a", "b"), "good", now).task;
    expect(task.state).toBe("learning");
    expect(bucketForTask(task, DEFAULT_CONFIG)).toBe("fragile");
    expect(isTaskHeld(task, DEFAULT_CONFIG)).toBe(false);
  });

  it("marks again as fragile even when stability exceeds graduation", () => {
    const task = applyReview(schedulerNewTask("a", "b"), "again", now).task;
    expect(bucketForTask(task, DEFAULT_CONFIG)).toBe("fragile");
  });

  it("requires review state and held stability threshold", () => {
    const heldTask = spacedReviews(["easy", "good", "good"]);
    expect(heldTask.state).toBe("review");
    expect((heldTask.stability ?? 0) >= DEFAULT_CONFIG.heldStabilityThreshold).toBe(true);
    expect(isTaskHeld(heldTask)).toBe(true);
    expect(isTaskMature(heldTask)).toBe(
      (heldTask.stability ?? 0) >= DEFAULT_CONFIG.matureStabilityThreshold,
    );
  });
});
