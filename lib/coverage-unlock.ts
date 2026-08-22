/**
 * K2 unlock rollup — monthly comfortable moves and before→after lines.
 * Contract: docs/specs/feature/content-traceability.md (T-W11b)
 */
import type { CoverageHistoryRow } from "@/lib/coverage";

export const COMFORT_THRESHOLD = 95;

export type SourceCoverageTimeline = {
  sourceId: string;
  history: readonly CoverageHistoryRow[];
  currentPercent: number;
};

export type UnlockLine = {
  beforePercent: number;
  measuredAt: string;
  afterPercent: number;
};

const isDemanding = (coveragePercent: number): boolean => coveragePercent < COMFORT_THRESHOLD;

const isComfortableOrSpeed = (coveragePercent: number): boolean =>
  coveragePercent >= COMFORT_THRESHOLD;

const monthBounds = (nowMs: number): { start: number; end: number } => {
  const date = new Date(nowMs);
  const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const sourceMovedToComfortableInMonth = (
  history: readonly CoverageHistoryRow[],
  currentPercent: number,
  nowMs: number,
): boolean => {
  const { start, end } = monthBounds(nowMs);
  const points: { at: number; percent: number }[] = [];

  for (const entry of history) {
    const at = Date.parse(entry.measuredAt);
    if (at >= start && at <= end) {
      points.push({ at, percent: entry.coveragePercent });
    }
  }

  if (nowMs >= start && nowMs <= end) {
    points.push({ at: nowMs, percent: currentPercent });
  }

  points.sort((a, b) => a.at - b.at);

  let sawDemanding = false;
  for (const point of points) {
    if (isDemanding(point.percent)) {
      sawDemanding = true;
    } else if (sawDemanding && isComfortableOrSpeed(point.percent)) {
      return true;
    }
  }

  return false;
};

export const countMovedToComfortableThisMonth = (
  timelines: readonly SourceCoverageTimeline[],
  nowMs: number,
): number =>
  timelines.filter((timeline) =>
    sourceMovedToComfortableInMonth(
      timeline.history,
      timeline.currentPercent,
      nowMs,
    ),
  ).length;

export const unlockLineForSource = (
  history: readonly CoverageHistoryRow[],
  currentPercent: number,
): UnlockLine | null => {
  if (!isComfortableOrSpeed(currentPercent)) return null;

  const demandingRows = history
    .filter((row) => isDemanding(row.coveragePercent))
    .sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt));

  const prior = demandingRows[0];
  if (!prior || currentPercent <= prior.coveragePercent) return null;

  return {
    beforePercent: prior.coveragePercent,
    measuredAt: prior.measuredAt,
    afterPercent: currentPercent,
  };
};

export type CoverageHistorySourceRow = CoverageHistoryRow & {
  sourceId: string;
};

export const historyBySourceId = (
  rows: readonly CoverageHistorySourceRow[],
): Map<string, CoverageHistoryRow[]> => {
  const map = new Map<string, CoverageHistoryRow[]>();
  for (const row of rows) {
    const bucket = map.get(row.sourceId) ?? [];
    bucket.push({
      measuredAt: row.measuredAt,
      coveragePercent: row.coveragePercent,
      calibrationDated: row.calibrationDated,
    });
    map.set(row.sourceId, bucket);
  }
  return map;
};
