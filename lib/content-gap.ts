/**
 * Gap-set derivation for demanding sources. Contract:
 * docs/specs/feature/content-gap.md
 */
import {
  computeCoverage,
  isTokenKnown,
  type CoverageResult,
  type Source,
} from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { StarterCard } from "@/lib/starter-deck";
import { applyReview, newTask, type Grade, type Task } from "@/lib/scheduler";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";

export const GAP_COMFORT_TARGET = 95;
export const GAP_LIST_CAP = 40;
export const GAP_PACE_WINDOW_DAYS = 14;

export type GapLemma = {
  lemma: string;
  frequencyRank: number;
  gloss: string;
};

export type GapView =
  | { kind: "none" }
  | {
      kind: "list";
      lemmas: readonly GapLemma[];
      gapCount: number;
      coverage: CoverageResult;
      projectedCoverage: number;
    }
  | {
      kind: "too-large";
      gapCount: number;
      coverage: CoverageResult;
      alternateSource: Pick<Source, "id" | "title"> | null;
    };

export type GapPaceEstimate = {
  days: number | null;
  range: { min: number; max: number } | null;
  pacePerDay: number | null;
};

const lemmasForToken = (form: string, lexicon: Lexicon): readonly string[] => {
  const resolution = lexicon.resolve(form);
  if (resolution.kind === "unknown") return [];
  if (resolution.kind === "single") return [resolution.analysis.lemma];
  if (resolution.kind === "ambiguous") return resolution.analyses.map((a) => a.lemma);
  return resolution.parts.flatMap((part) => lemmasForToken(part, lexicon));
};

const unknownLemmasInSource = (
  text: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): Map<string, number> => {
  const unknown = new Map<string, number>();
  for (const token of lexicon.tokenise(text)) {
    if (isTokenKnown(token.text, lexicon, heldLemmas)) continue;
    for (const lemma of lemmasForToken(token.text, lexicon)) {
      const rank = lexicon.rank(lemma);
      if (rank === undefined) continue;
      const previous = unknown.get(lemma);
      if (previous === undefined || rank < previous) unknown.set(lemma, rank);
    }
  }
  return unknown;
};

export const computeGapSet = (
  text: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  options?: {
    targetPercent?: number;
    cap?: number;
    glossForLemma?: (lemma: string) => string;
  },
): GapView => {
  const targetPercent = options?.targetPercent ?? GAP_COMFORT_TARGET;
  const cap = options?.cap ?? GAP_LIST_CAP;
  const coverage = computeCoverage(text, lexicon, heldLemmas);

  if (coverage.coveragePercent >= targetPercent) {
    return { kind: "none" };
  }

  const candidates = [...unknownLemmasInSource(text, lexicon, heldLemmas).entries()].sort(
    (a, b) => a[1] - b[1] || a[0].localeCompare(b[0]),
  );

  const simulated = new Set(heldLemmas);
  const gapLemmas: GapLemma[] = [];

  for (const [lemma, frequencyRank] of candidates) {
    simulated.add(lemma);
    gapLemmas.push({
      lemma,
      frequencyRank,
      gloss: options?.glossForLemma?.(lemma) ?? "",
    });
    if (computeCoverage(text, lexicon, simulated).coveragePercent >= targetPercent) {
      break;
    }
  }

  const projectedCoverage = computeCoverage(text, lexicon, simulated).coveragePercent;

  if (gapLemmas.length > cap) {
    return {
      kind: "too-large",
      gapCount: gapLemmas.length,
      coverage,
      alternateSource: null,
    };
  }

  return {
    kind: "list",
    lemmas: gapLemmas,
    gapCount: gapLemmas.length,
    coverage,
    projectedCoverage,
  };
};

export const pickAlternateSource = (
  entries: readonly {
    source: Source;
    coverage: CoverageResult;
    gapCount: number;
  }[],
  currentId: string,
): Pick<Source, "id" | "title"> | null => {
  const current = entries.find((entry) => entry.source.id === currentId);
  if (!current) return null;

  const alternate = entries
    .filter(
      (entry) =>
        entry.source.id !== currentId &&
        entry.coverage.comfortBand === "demanding" &&
        entry.coverage.coveragePercent > current.coverage.coveragePercent,
    )
    .sort((a, b) => b.coverage.coveragePercent - a.coverage.coveragePercent)[0];

  return alternate ? { id: alternate.source.id, title: alternate.source.title } : null;
};

export const estimateGapPace = (
  gapCount: number,
  dailyHeldCounts: readonly number[],
): GapPaceEstimate => {
  if (gapCount <= 0) return { days: null, range: null, pacePerDay: null };

  const window = dailyHeldCounts.slice(-GAP_PACE_WINDOW_DAYS);
  if (window.length === 0) return { days: null, range: null, pacePerDay: null };

  const pacePerDay = window.reduce((sum, count) => sum + count, 0) / window.length;
  if (pacePerDay <= 0) return { days: null, range: null, pacePerDay: null };

  const days = Math.ceil(gapCount / pacePerDay);
  const mean = pacePerDay;
  const variance =
    window.reduce((sum, count) => sum + (count - mean) ** 2, 0) / window.length;
  const highVariance = variance > 1;

  return {
    days,
    pacePerDay,
    range: highVariance ? { min: Math.max(1, days - 1), max: days + 1 } : null,
  };
};

export const gapSetProgress = (
  gapLemmas: readonly string[],
  heldLemmas: ReadonlySet<string>,
): { held: number; total: number } => {
  const held = gapLemmas.filter((lemma) => heldLemmas.has(lemma)).length;
  return { held, total: gapLemmas.length };
};

const DAY_MS = 86_400_000;

export const dailyHeldLemmaCounts = (
  cards: readonly StarterCard[],
  reviews: readonly { taskId: string; reviewedAt: string; grade: Grade }[],
  now: number,
  windowDays: number = GAP_PACE_WINDOW_DAYS,
): number[] => {
  const meaningCards = cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  const tasks = new Map(
    meaningCards.map((card) => [card.taskId, newTask(card.taskId, card.wordId)] as const),
  );
  const heldBefore = new Map<string, boolean>();

  const sorted = [...reviews].sort(
    (a, b) => Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt),
  );

  const dayStart = now - windowDays * DAY_MS;
  const counts = new Map<string, number>();

  for (const review of sorted) {
    const task = tasks.get(review.taskId);
    if (!task) continue;

    const wasHeld = heldBefore.get(review.taskId) ?? isTaskHeld(task);
    const result = applyReview(task, review.grade, Date.parse(review.reviewedAt));
    tasks.set(review.taskId, result.task);
    const nowHeld = isTaskHeld(result.task);
    heldBefore.set(review.taskId, nowHeld);

    if (!wasHeld && nowHeld) {
      const dayKey = new Date(Date.parse(review.reviewedAt)).toISOString().slice(0, 10);
      if (Date.parse(review.reviewedAt) >= dayStart) {
        counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
      }
    }
  }

  return Array.from({ length: windowDays }, (_, index) => {
    const day = new Date(dayStart + index * DAY_MS).toISOString().slice(0, 10);
    return counts.get(day) ?? 0;
  });
};

export const heldLemmaSet = (
  cards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
): Set<string> => {
  const held = new Set<string>();
  for (const card of cards) {
    if (!isMeaningRecallTaskId(card.taskId)) continue;
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    if (isTaskHeld(task)) held.add(card.lemma);
  }
  return held;
};
