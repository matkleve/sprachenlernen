/**
 * Coverage snapshot persistence for K2 history. Contract:
 * docs/specs/service/coverage.md (coverage_history rows)
 */
import {
  computeCoverage,
  sourceText,
  type CoverageHistoryRow,
  type Source,
} from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";

export type CoverageSnapshotInput = {
  sourceId: string;
  coveragePercent: number;
  calibrationDated: string | null;
};

export const coverageSnapshotsToAppend = (
  sources: readonly Source[],
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  latestPercentBySourceId: ReadonlyMap<string, number>,
): CoverageSnapshotInput[] => {
  const profile = lexicon.profile;
  const calibrationDated = profile.calibration?.dated ?? null;
  const snapshots: CoverageSnapshotInput[] = [];

  for (const source of sources) {
    if (source.ephemeral) continue;
    const text = sourceText(source);
    if (text.trim() === "") continue;

    const coverage = computeCoverage(text, lexicon, heldLemmas);
    const latest = latestPercentBySourceId.get(source.id);
    if (latest === coverage.coveragePercent) continue;

    snapshots.push({
      sourceId: source.id,
      coveragePercent: coverage.coveragePercent,
      calibrationDated,
    });
  }

  return snapshots;
};

export const mapLatestPercentBySource = (
  rows: readonly { sourceId: string; coveragePercent: number; measuredAt: string }[],
): Map<string, number> => {
  const latest = new Map<string, { percent: number; at: number }>();
  for (const row of rows) {
    const at = Date.parse(row.measuredAt);
    const held = latest.get(row.sourceId);
    if (!held || at >= held.at) {
      latest.set(row.sourceId, { percent: row.coveragePercent, at });
    }
  }
  return new Map(
    [...latest.entries()].map(([sourceId, value]) => [sourceId, value.percent]),
  );
};

export const appendSnapshotsToHistory = (
  history: readonly CoverageHistoryRow[],
  snapshots: readonly CoverageSnapshotInput[],
  measuredAt: string,
): CoverageHistoryRow[] => [
  ...history,
  ...snapshots.map((snapshot) => ({
    measuredAt,
    coveragePercent: snapshot.coveragePercent,
    calibrationDated: snapshot.calibrationDated,
  })),
];
