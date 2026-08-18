/**
 * Per-distinct-card run status for the review session strip.
 * Contract: docs/specs/feature/review-session.md § Run status strip.
 */

import type { Grade } from "@/lib/scheduler";
import type { SessionCard } from "@/lib/session-builder";

export type RunSegmentStatus =
  | "pending"
  | "current"
  | "again"
  | "hard"
  | "requeued"
  | "done";

export type RunSegment = {
  taskId: string;
  status: RunSegmentStatus;
};

/** Distinct cards in first-seen order — one segment per task in the built run. */
export function initRunSegments(queue: SessionCard[]): RunSegment[] {
  const seen = new Set<string>();
  const segments: RunSegment[] = [];

  for (const card of queue) {
    if (seen.has(card.taskId)) continue;
    seen.add(card.taskId);
    segments.push({ taskId: card.taskId, status: "pending" });
  }

  return segments;
}

export function gradeRunSegment(
  segments: RunSegment[],
  gradedTaskId: string,
  grade: Grade,
): RunSegment[] {
  return segments.map((segment) => {
    if (segment.taskId !== gradedTaskId) return segment;
    if (grade === "again") return { ...segment, status: "again" };
    if (grade === "hard") return { ...segment, status: "hard" };
    return { ...segment, status: "done" };
  });
}

function nextQueueIndex(queue: SessionCard[], sessionIndex: number, taskId: string): number {
  const index = queue.findIndex((card, i) => i >= sessionIndex && card.taskId === taskId);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

/** Order segments by next encounter in the queue; done cards keep stable left bias. */
export function orderRunSegments(
  segments: RunSegment[],
  queue: SessionCard[],
  sessionIndex: number,
): RunSegment[] {
  return [...segments].sort((left, right) => {
    const leftIndex = nextQueueIndex(queue, sessionIndex, left.taskId);
    const rightIndex = nextQueueIndex(queue, sessionIndex, right.taskId);

    if (leftIndex !== rightIndex) return leftIndex - rightIndex;

    const leftDone = left.status === "done" ? 0 : 1;
    const rightDone = right.status === "done" ? 0 : 1;
    if (leftDone !== rightDone) return leftDone - rightDone;

    return segments.indexOf(left) - segments.indexOf(right);
  });
}

export function displayRunSegments(
  segments: RunSegment[],
  queue: SessionCard[],
  sessionIndex: number,
  currentTaskId: string | null,
): RunSegment[] {
  const ordered = orderRunSegments(segments, queue, sessionIndex);

  return ordered.map((segment) => {
    if (segment.taskId !== currentTaskId) return segment;
    if (segment.status === "again" || segment.status === "hard") {
      return { ...segment, status: "requeued" };
    }
    if (segment.status === "pending") {
      return { ...segment, status: "current" };
    }
    return segment;
  });
}
