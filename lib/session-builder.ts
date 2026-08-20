/**
 * Session queue builder. Contract: docs/specs/service/session-builder.md
 */

import { isFormRecallTaskId, isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { cellCandidatesFromCards } from "@/lib/form-cell-catalog";
import {
  countNewCellIntroductionsToday,
  filterNewCellCandidates,
} from "@/lib/form-introduction";
import { buildFormSessionWithPullForward } from "@/lib/form-pull-forward";
import { mixFormSession, type LemmaMeta } from "@/lib/form-session-mixing";
import type { ReviewDeck } from "@/lib/review-deck";
import type { SamplingContext, SamplingReason } from "@/lib/session-sampling";
import { countHeldMeaningRecall } from "@/lib/sampling-context";
import { sampleSession } from "@/lib/session-sampling";
import type { StarterCard } from "@/lib/starter-deck";
import type { Task } from "@/lib/scheduler";
import type { FormCellExplanationData } from "@/lib/form-cell-explanation";

export type SessionCard = StarterCard & {
  position: number;
  total: number;
  /** Populated on form-recall cards when a rule exists — UC-022 / T-W21. */
  formExplanation?: FormCellExplanationData;
  /** Accepted surfaces for typed grading — form-recall only (T-W6). */
  acceptedForms?: readonly string[];
  /** All lemma surfaces — accent-collision check for typed route (T-W6). */
  lemmaSurfaces?: readonly string[];
  /** Why this card was drawn — UC-079 / G1 follow-on. */
  samplingReason?: SamplingReason;
};

export const DEFAULT_SESSION_LENGTH = 15;

export type BuildSessionOptions = {
  priorityLemmas?: ReadonlySet<string>;
  deck?: ReviewDeck;
  sampling?: SamplingContext;
  /** Deterministic draws in tests; production uses secure random via sampleSession default. */
  rng?: () => number;
  /** Lemma conjugation metadata for form-session mixing (T-W6). */
  lemmaMeta?: LemmaMeta;
  /** Cell-based form pool — when set, `deck=form` uses paradigm-cell tasks (T-W6 v3). */
  formCellPool?: StarterCard[];
  /** First-review timestamps for cell tasks — introduction cap (T-W6 v3). */
  firstCellReviews?: readonly { taskId: string; reviewedAt: number }[];
};

/**
 * Builds a fixed-length session from the starter pool and optional review
 * history. Pure — callers supply `now` for testability (scheduler contract).
 */
export function buildSession(
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
  now: number,
  sessionLength: number = DEFAULT_SESSION_LENGTH,
  options?: BuildSessionOptions,
): SessionCard[] {
  const deck = options?.deck ?? "mixed";
  const sampling: SamplingContext = options?.sampling ?? {
    heldMeaningRecall: countHeldFromPool(pool, tasksByTaskId),
    newFirstReviewCountToday: 0,
    gradesTodayByTaskId: {},
  };

  let samplePool = pool;
  if (deck === "form" && options?.formCellPool) {
    const introducedToday = countNewCellIntroductionsToday(
      options.firstCellReviews ?? [],
      now,
    );
    const eligibleIds = new Set(
      filterNewCellCandidates(cellCandidatesFromCards(options.formCellPool), tasksByTaskId, {
        sessionLength,
        introducedTodayCount: introducedToday,
      }).map((row) => row.taskId),
    );
    samplePool = options.formCellPool.filter((card) => eligibleIds.has(card.taskId));
  }

  const picked = sampleSession(samplePool, tasksByTaskId, now, sessionLength, sampling, {
    deck,
    priorityLemmas: options?.priorityLemmas,
    rng: options?.rng,
    config: sampling.config,
  });

  if (deck === "form" && options?.formCellPool) {
    return buildFormCellSession({
      pool: samplePool,
      tasksByTaskId,
      now,
      sessionLength,
      picked,
      options,
    });
  }

  const total = picked.length;

  const sessionCards = picked.map((entry, index) => ({
    taskId: entry.card.taskId,
    wordId: entry.card.wordId,
    lemma: entry.card.lemma,
    front: entry.card.front,
    descriptionKey: entry.card.descriptionKey,
    back: entry.card.back ?? "",
    frequencyRank: entry.card.frequencyRank,
    paradigmCell: entry.card.paradigmCell,
    position: index + 1,
    total,
    samplingReason: entry.samplingReason,
  }));

  if (deck === "form") {
    const mixed = mixFormSession(sessionCards, { lemmaMeta: options?.lemmaMeta });
    return mixed.map((card, index) => {
      const source = sessionCards.find((entry) => entry.taskId === card.taskId) ?? card;
      return {
        ...source,
        ...card,
        position: index + 1,
        total,
      };
    });
  }

  return sessionCards;
}

function buildFormCellSession(input: {
  pool: StarterCard[];
  tasksByTaskId: Record<string, Task>;
  now: number;
  sessionLength: number;
  picked: ReturnType<typeof sampleSession>;
  options?: BuildSessionOptions;
}): SessionCard[] {
  const { pool, tasksByTaskId, now, sessionLength, picked, options } = input;

  const dueCards = picked.map((entry) => entry.card);
  const pickedIds = new Set(dueCards.map((card) => card.taskId));
  const reserveCards = pool.filter((card) => !pickedIds.has(card.taskId));

  const ordered = buildFormSessionWithPullForward({
    dueCards,
    reserveCards,
    sessionLength,
    lemmaMeta: options?.lemmaMeta ?? {},
    tasksByTaskId,
    now,
  });

  const metaByTaskId = new Map(
    picked.map((entry) => [entry.card.taskId, entry.samplingReason] as const),
  );
  const total = ordered.length;

  return ordered.map((card, index) => ({
    ...card,
    position: index + 1,
    total,
    samplingReason: metaByTaskId.get(card.taskId),
  }));
}

function countHeldFromPool(
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
): number {
  const meaningCards = pool.filter((card) => isMeaningRecallTaskId(card.taskId));
  return countHeldMeaningRecall(meaningCards, tasksByTaskId);
}
