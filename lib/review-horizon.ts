/**
 * Review horizon presentation logic. Contract:
 * docs/specs/feature/review-horizon.md
 */

import { HORIZON_DAYS, type HorizonBin } from "@/lib/vocabulary-snapshot";

const DAY_MS = 86_400_000;
const WEEKS = 4;
const DAYS_PER_WEEK = 7;

export const HORIZON_GAP_DAYS = 7;
export const HORIZON_BULK_ADD_COUNT = 30;
export const HORIZON_BULK_ADD_WINDOW_MS = 48 * DAY_MS;
export const HORIZON_PEAK_RATIO = 2.5;
export const HORIZON_FIRST_WEEK_MS = 7 * DAY_MS;
export const HORIZON_ROUTINE_DAYS = 5;
export const HORIZON_ROUTINE_WINDOW_MS = 7 * DAY_MS;
export const HORIZON_TILE_CAP = 24;

export type HorizonWeek = {
  weekIndex: number;
  dayOffsets: readonly number[];
  dailyCounts: readonly number[];
  total: number;
  avgPerDay: number;
};

export type HorizonTaskMeta = {
  taskId: string;
  due: number;
  firstReviewAt: number | null;
};

export type HorizonRelevanceInput = {
  reviewTimestamps: readonly number[];
  firstReviewByTaskId: ReadonlyMap<string, number>;
};

export type HorizonCausal = {
  weekIndex: number;
  cardCount: number;
  addedAt: number;
};

export type HorizonDisplay = {
  weeks: readonly HorizonWeek[];
  peakWeekIndex: number | null;
  triggers: {
    returnAfterGap: boolean;
    bulkAdd: boolean;
    peakWeek: boolean;
    firstWeek: boolean;
  };
  routineLearner: boolean;
  startExpanded: boolean;
  loadTone: "light" | "steady" | "peak";
  causal: HorizonCausal | null;
};

export function aggregateHorizonWeeks(horizon: readonly HorizonBin[]): HorizonWeek[] {
  return Array.from({ length: WEEKS }, (_, weekIndex) => {
    const start = weekIndex * DAYS_PER_WEEK;
    const dayOffsets = Array.from({ length: DAYS_PER_WEEK }, (_, index) => start + index);
    const dailyCounts = dayOffsets.map((dayOffset) => horizon[dayOffset]?.count ?? 0);
    const total = dailyCounts.reduce((sum, count) => sum + count, 0);
    return {
      weekIndex,
      dayOffsets,
      dailyCounts,
      total,
      avgPerDay: total / DAYS_PER_WEEK,
    };
  });
}

function distinctReviewDaysInWindow(reviewTimestamps: readonly number[], now: number): number {
  const windowStart = now - HORIZON_ROUTINE_WINDOW_MS;
  const days = new Set<number>();
  for (const at of reviewTimestamps) {
    if (at >= windowStart && at <= now) {
      days.add(Math.floor(at / DAY_MS));
    }
  }
  return days.size;
}

function countRecentFirstReviews(
  firstReviewByTaskId: ReadonlyMap<string, number>,
  now: number,
): number {
  const windowStart = now - HORIZON_BULK_ADD_WINDOW_MS;
  let count = 0;
  for (const at of firstReviewByTaskId.values()) {
    if (at >= windowStart && at <= now) count += 1;
  }
  return count;
}

function peakWeekIndex(weeks: readonly HorizonWeek[]): number | null {
  if (weeks.length === 0) return null;
  const totals = weeks.map((week) => week.total);
  const max = Math.max(...totals);
  if (max === 0) return null;
  return totals.indexOf(max);
}

function isPeakWeekTrigger(weeks: readonly HorizonWeek[]): boolean {
  const index = peakWeekIndex(weeks);
  if (index === null) return false;
  const totals = weeks.map((week) => week.total);
  const max = totals[index] ?? 0;
  const others = totals.filter((_, weekIndex) => weekIndex !== index);
  const meanOthers = others.reduce((sum, value) => sum + value, 0) / others.length;
  if (meanOthers === 0) return false;
  return max >= HORIZON_PEAK_RATIO * meanOthers;
}

function lastReviewAt(reviewTimestamps: readonly number[]): number | null {
  if (reviewTimestamps.length === 0) return null;
  return Math.max(...reviewTimestamps);
}

export function deriveHorizonCausal(
  weeks: readonly HorizonWeek[],
  tasks: readonly HorizonTaskMeta[],
  peakIndex: number,
  now: number,
): HorizonCausal | null {
  const week = weeks[peakIndex];
  if (!week || week.total === 0) return null;

  const peakDayOffsets = new Set(week.dayOffsets);
  const countsByFirstReviewDay = new Map<number, number>();

  for (const task of tasks) {
    if (task.firstReviewAt === null) continue;
    const dayOffset = Math.floor((task.due - now) / DAY_MS);
    if (!peakDayOffsets.has(dayOffset)) continue;
    const firstDay = Math.floor(task.firstReviewAt / DAY_MS);
    countsByFirstReviewDay.set(firstDay, (countsByFirstReviewDay.get(firstDay) ?? 0) + 1);
  }

  let bestDay: number | null = null;
  let bestCount = 0;
  for (const [day, count] of countsByFirstReviewDay) {
    if (count > bestCount) {
      bestDay = day;
      bestCount = count;
    }
  }

  if (bestDay === null || bestCount < 10) return null;
  if (bestCount / week.total < 0.3) return null;

  return { weekIndex: peakIndex, cardCount: bestCount, addedAt: bestDay * DAY_MS };
}

export function buildHorizonDisplay(
  horizon: readonly HorizonBin[],
  now: number,
  relevance: HorizonRelevanceInput,
  tasks: readonly HorizonTaskMeta[],
): HorizonDisplay {
  const weeks = aggregateHorizonWeeks(horizon);
  const peakIndex = peakWeekIndex(weeks);
  const lastReview = lastReviewAt(relevance.reviewTimestamps);
  const firstReview = relevance.reviewTimestamps.length
    ? Math.min(...relevance.reviewTimestamps)
    : null;

  const returnAfterGap =
    lastReview !== null && now - lastReview >= HORIZON_GAP_DAYS * DAY_MS;
  const bulkAdd = countRecentFirstReviews(relevance.firstReviewByTaskId, now) >= HORIZON_BULK_ADD_COUNT;
  const peakWeek = isPeakWeekTrigger(weeks);
  const firstWeek = firstReview !== null && now - firstReview < HORIZON_FIRST_WEEK_MS;
  const routineLearner =
    distinctReviewDaysInWindow(relevance.reviewTimestamps, now) >= HORIZON_ROUTINE_DAYS;

  const triggers = { returnAfterGap, bulkAdd, peakWeek, firstWeek };
  const startExpanded = returnAfterGap || bulkAdd || peakWeek || firstWeek;

  const maxAvg = Math.max(...weeks.map((week) => week.avgPerDay));
  const loadTone: HorizonDisplay["loadTone"] =
    maxAvg < 5 ? "light" : peakWeek ? "peak" : "steady";

  const causal =
    peakIndex !== null && (peakWeek || bulkAdd)
      ? deriveHorizonCausal(weeks, tasks, peakIndex, now)
      : null;

  return {
    weeks,
    peakWeekIndex: peakIndex,
    triggers,
    routineLearner,
    startExpanded,
    loadTone,
    causal,
  };
}

export function tileCountForReviews(count: number): { shown: number; overflow: number } {
  if (count <= 0) return { shown: 0, overflow: 0 };
  if (count <= HORIZON_TILE_CAP) return { shown: count, overflow: 0 };
  return { shown: HORIZON_TILE_CAP, overflow: count - HORIZON_TILE_CAP };
}
