/**
 * Lazy cell introduction — weight, never gate. Contract:
 * docs/specs/service/form-practice.md (introduction §)
 */

import type { Task } from "@/lib/scheduler";
import { newTask } from "@/lib/scheduler";

/** Configured cap — answers the "not all tenses at once" pool-size objection. */
export const DEFAULT_NEW_CELL_CAP_PER_DAY = 3;

export type CellCandidate = {
  taskId: string;
  lemma: string;
  cell: string;
  frequencyRank: number;
};

export type IntroductionFilterOptions = {
  capPerDay: number;
  introducedTodayCount: number;
};

const DAY_MS = 86_400_000;

export function isSubjunctiveCell(cell: string): boolean {
  return cell.includes(".subj.") || cell.startsWith("sub.");
}

/** Lower sorts earlier in automatic introduction order. */
export function cellIntroductionSortKey(cell: string): number {
  if (isSubjunctiveCell(cell)) return 1_000;
  if (cell.startsWith("ind.pres.")) return 0;
  if (cell.startsWith("ind.")) return 100;
  if (cell.startsWith("cond.") || cell.startsWith("imp.")) return 200;
  if (cell === "inf" || cell.startsWith("ger") || cell.startsWith("part.")) return 300;
  return 400;
}

export function compareCellIntroductionOrder(left: CellCandidate, right: CellCandidate): number {
  const classDelta =
    cellIntroductionSortKey(left.cell) - cellIntroductionSortKey(right.cell);
  if (classDelta !== 0) return classDelta;
  return left.frequencyRank - right.frequencyRank || left.lemma.localeCompare(right.lemma);
}

export function isIntroducedCellTask(task: Task): boolean {
  return task.reviews.length > 0;
}

export function countNewCellIntroductionsToday(
  firstReviews: readonly { taskId: string; reviewedAt: number }[],
  now: number,
): number {
  const dayKey = new Date(now).toISOString().slice(0, 10);
  return firstReviews.filter(
    (row) => new Date(row.reviewedAt).toISOString().slice(0, 10) === dayKey,
  ).length;
}

/**
 * Drops never-reviewed cell candidates when the daily introduction cap is full.
 * Introduced cells (any prior review) always pass through.
 */
export function filterNewCellCandidates(
  candidates: readonly CellCandidate[],
  tasksByTaskId: Record<string, Task>,
  options: IntroductionFilterOptions,
): CellCandidate[] {
  const taskFor = (candidate: CellCandidate): Task =>
    tasksByTaskId[candidate.taskId] ?? newTask(candidate.taskId, `es:${candidate.lemma}`);

  const remaining = Math.max(0, options.capPerDay - options.introducedTodayCount);
  if (remaining === 0) {
    return candidates.filter((candidate) => isIntroducedCellTask(taskFor(candidate)));
  }

  const introduced = candidates.filter((candidate) => isIntroducedCellTask(taskFor(candidate)));
  const fresh = candidates
    .filter((candidate) => !isIntroducedCellTask(taskFor(candidate)))
    .sort(compareCellIntroductionOrder)
    .slice(0, remaining);

  return [...introduced, ...fresh];
}

export function startOfUtcDayMs(now: number): number {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function isSameUtcDay(leftMs: number, rightMs: number): boolean {
  return (
    new Date(leftMs).toISOString().slice(0, 10) ===
    new Date(rightMs).toISOString().slice(0, 10)
  );
}

export function firstReviewTimesByTaskId(
  reviews: readonly { taskId: string; reviewedAt: string | number }[],
): { taskId: string; reviewedAt: number }[] {
  const first = new Map<string, number>();
  for (const row of reviews) {
    const at = typeof row.reviewedAt === "number" ? row.reviewedAt : Date.parse(row.reviewedAt);
    const previous = first.get(row.taskId);
    if (previous === undefined || at < previous) {
      first.set(row.taskId, at);
    }
  }
  return [...first.entries()].map(([taskId, reviewedAt]) => ({ taskId, reviewedAt }));
}
