/**
 * Lazy cell introduction — weight, never gate. Contract:
 * docs/specs/service/form-practice.md (introduction §)
 */

import type { Task } from "@/lib/scheduler";
import { newTask } from "@/lib/scheduler";

/** Per-session cap — aligned with study/44 foundation new-card cap. */
export const DEFAULT_NEW_CELL_CAP_PER_SESSION = 5;

/** Sanity ceiling for power users running many sessions per UTC day. */
export const DEFAULT_NEW_CELL_DAILY_CEILING = 15;

/** Soft daily throttle — same shape as meaning-recall `lambdaNewToday`. */
export const DEFAULT_LAMBDA_NEW_CELLS_TODAY = 0.15;

export type CellCandidate = {
  taskId: string;
  lemma: string;
  cell: string;
  frequencyRank: number;
};

export type IntroductionFilterOptions = {
  sessionLength: number;
  introducedTodayCount: number;
  capPerSession?: number;
  dailyCeiling?: number;
  lambdaNewToday?: number;
};

export function newCellCapPerSession(
  sessionLength: number,
  capPerSession: number = DEFAULT_NEW_CELL_CAP_PER_SESSION,
): number {
  return Math.min(capPerSession, sessionLength);
}

/**
 * How many brand-new cells may enter this session's automatic pool after pacing.
 */
export function effectiveNewCellBudget(options: IntroductionFilterOptions): number {
  const capPerSession = options.capPerSession ?? DEFAULT_NEW_CELL_CAP_PER_SESSION;
  const dailyCeiling = options.dailyCeiling ?? DEFAULT_NEW_CELL_DAILY_CEILING;
  const lambda = options.lambdaNewToday ?? DEFAULT_LAMBDA_NEW_CELLS_TODAY;

  const sessionCap = newCellCapPerSession(options.sessionLength, capPerSession);
  const headroom = Math.max(0, dailyCeiling - options.introducedTodayCount);
  const softScaled = Math.floor(
    sessionCap * Math.exp(-lambda * options.introducedTodayCount),
  );

  return Math.min(sessionCap, headroom, Math.max(0, softScaled));
}

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
 * Drops never-reviewed cell candidates when the introduction budget is full.
 * Introduced cells (any prior review) always pass through.
 */
export function filterNewCellCandidates(
  candidates: readonly CellCandidate[],
  tasksByTaskId: Record<string, Task>,
  options: IntroductionFilterOptions,
): CellCandidate[] {
  const taskFor = (candidate: CellCandidate): Task =>
    tasksByTaskId[candidate.taskId] ?? newTask(candidate.taskId, `es:${candidate.lemma}`);

  const remaining = effectiveNewCellBudget(options);
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
