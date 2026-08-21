/**
 * Builds session-sampling inputs from materialized task state. Contract:
 * docs/specs/service/session-sampling.md
 */

import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { TaskStateRow } from "@/lib/task-from-state";
import type { SamplingContext } from "@/lib/session-sampling";
import type { StarterCard } from "@/lib/starter-deck";
import type { Grade, Task } from "@/lib/scheduler";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";

const SUCCESS: ReadonlySet<Grade> = new Set(["hard", "good", "easy"]);

function isSameLocalCalendarDay(timestampMs: number, now: number): boolean {
  const a = new Date(timestampMs);
  const b = new Date(now);
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

function rowReviewedToday(row: TaskStateRow, now: number): boolean {
  if (!row.lastReviewAt) return false;
  return isSameLocalCalendarDay(Date.parse(row.lastReviewAt), now);
}

export function buildSamplingContext(
  cards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
  rows: readonly TaskStateRow[],
  now: number,
): SamplingContext {
  const rowByTaskId = new Map(rows.map((row) => [row.taskId, row]));
  const gradesTodayByTaskId = new Map<string, Grade>();
  const reviewCountByTaskId = new Map<string, number>();
  let newFirstReviewCountToday = 0;
  let heldMeaningRecall = 0;
  const meaningSuccessCountByWordId = new Map<string, number>();

  for (const row of rows) {
    reviewCountByTaskId.set(row.taskId, row.reviewCount);
    if (!rowReviewedToday(row, now) || !row.lastGrade) continue;
    gradesTodayByTaskId.set(row.taskId, row.lastGrade);
    if (row.reviewCount === 1) {
      newFirstReviewCountToday += 1;
    }
  }

  for (const card of cards) {
    if (!isMeaningRecallTaskId(card.taskId)) continue;
    const task = tasksByTaskId[card.taskId];
    if (task && isTaskHeld(task)) {
      heldMeaningRecall += 1;
    }
    const row = rowByTaskId.get(card.taskId);
    const successes = row
      ? row.lastGrade && SUCCESS.has(row.lastGrade)
        ? Math.max(1, row.reviewCount)
        : Math.max(0, row.reviewCount - 1)
      : 0;
    meaningSuccessCountByWordId.set(
      card.wordId,
      task && isTaskHeld(task) ? 3 : successes,
    );
  }

  return {
    now,
    heldMeaningRecall,
    newFirstReviewCountToday,
    gradesTodayByTaskId,
    meaningSuccessCountByWordId,
    reviewCountByTaskId,
  };
}

export function emptySamplingContext(now: number, rng?: () => number): SamplingContext {
  return {
    now,
    heldMeaningRecall: 0,
    newFirstReviewCountToday: 0,
    gradesTodayByTaskId: new Map(),
    meaningSuccessCountByWordId: new Map(),
    reviewCountByTaskId: new Map(),
    rng,
    pickIndex: (weights) => {
      let best = 0;
      let bestWeight = weights[0] ?? 0;
      for (let index = 1; index < weights.length; index += 1) {
        const weight = weights[index] ?? 0;
        if (weight > bestWeight) {
          bestWeight = weight;
          best = index;
        }
      }
      return best;
    },
  };
}
