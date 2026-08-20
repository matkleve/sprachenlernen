/**
 * Sampling context from review history. Contract:
 * docs/specs/service/session-sampling.md
 */

import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { StarterCard } from "@/lib/starter-deck";
import { DEFAULT_CONFIG, newTask, type Grade, type Task } from "@/lib/scheduler";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";
import type { SamplingConfig, SamplingContext } from "@/lib/session-sampling";
import { DEFAULT_SAMPLING_CONFIG } from "@/lib/session-sampling";

const DAY_MS = 86_400_000;

function startOfUtcDayMs(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function buildSamplingContext(
  reviews: ReadonlyArray<{ taskId: string; grade: Grade; reviewedAt: string | number }>,
  meaningCards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
  now: number,
  config: SamplingConfig = DEFAULT_SAMPLING_CONFIG,
): SamplingContext {
  const dayStart = startOfUtcDayMs(now);
  const dayEnd = dayStart + DAY_MS;

  const firstReviewAtByTaskId = new Map<string, number>();
  const gradesTodayByTaskId: Record<string, Grade> = {};

  const sorted = [...reviews].sort((a, b) => {
    const aAt = typeof a.reviewedAt === "string" ? Date.parse(a.reviewedAt) : a.reviewedAt;
    const bAt = typeof b.reviewedAt === "string" ? Date.parse(b.reviewedAt) : b.reviewedAt;
    return aAt - bAt;
  });

  for (const row of sorted) {
    const at =
      typeof row.reviewedAt === "string" ? Date.parse(row.reviewedAt) : row.reviewedAt;
    if (!firstReviewAtByTaskId.has(row.taskId)) {
      firstReviewAtByTaskId.set(row.taskId, at);
    }
    if (at >= dayStart && at < dayEnd) {
      gradesTodayByTaskId[row.taskId] = row.grade;
    }
  }

  let newFirstReviewCountToday = 0;
  for (const firstAt of firstReviewAtByTaskId.values()) {
    if (firstAt >= dayStart && firstAt < dayEnd) {
      newFirstReviewCountToday += 1;
    }
  }

  return {
    heldMeaningRecall: countHeldMeaningRecall(meaningCards, tasksByTaskId),
    newFirstReviewCountToday,
    gradesTodayByTaskId,
    config,
  };
}

export function countHeldMeaningRecall(
  meaningCards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
): number {
  let held = 0;
  for (const card of meaningCards) {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    if (isTaskHeld(task, DEFAULT_CONFIG)) held += 1;
  }
  return held;
}

export function meaningCardsFromPool(pool: readonly StarterCard[]): StarterCard[] {
  return pool.filter((card) => isMeaningRecallTaskId(card.taskId));
}
