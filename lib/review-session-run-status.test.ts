import { describe, expect, it } from "vitest";

import {
  displayRunSegments,
  gradeRunSegment,
  initRunSegments,
  orderRunSegments,
} from "@/lib/review-session-run-status";
import type { SessionCard } from "@/lib/session-builder";

function card(taskId: string, position: number, total = 2): SessionCard {
  return {
    taskId,
    wordId: taskId,
    lemma: taskId,
    front: taskId,
    back: taskId,
    descriptionKey: `card.${taskId}.meaning-recall.back`,
    frequencyRank: position,
    position,
    total,
  };
}

describe("review-session-run-status", () => {
  it("builds one segment per distinct task", () => {
    const queue = [card("a", 1), card("b", 2)];
    expect(initRunSegments(queue)).toEqual([
      { taskId: "a", status: "pending" },
      { taskId: "b", status: "pending" },
    ]);
  });

  it("marks poor grades and reorders segments by next queue index", () => {
    const queue = [card("a", 1), card("b", 2)];
    let segments = initRunSegments(queue);
    segments = gradeRunSegment(segments, "a", "again");

    const requeued = [card("a", 1), card("b", 2), card("a", 1)];
    const ordered = orderRunSegments(segments, requeued, 1);

    expect(ordered.map((segment) => segment.taskId)).toEqual(["b", "a"]);
    expect(ordered.find((segment) => segment.taskId === "a")?.status).toBe("again");
  });

  it("shows a repeat encounter as requeued while it is current", () => {
    const queue = [card("a", 1), card("b", 2), card("a", 1)];
    const segments = gradeRunSegment(initRunSegments(queue), "a", "again");

    const display = displayRunSegments(segments, queue, 2, "a");
    expect(display.find((segment) => segment.taskId === "a")?.status).toBe("requeued");
  });
});
