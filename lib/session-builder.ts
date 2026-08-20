/**
 * Session queue builder. Contract: docs/specs/service/session-builder.md
 */

import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
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

  const picked = sampleSession(pool, tasksByTaskId, now, sessionLength, sampling, {
    deck,
    priorityLemmas: options?.priorityLemmas,
    rng: options?.rng,
    config: sampling.config,
  });

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
    return mixFormSession(sessionCards, { lemmaMeta: options?.lemmaMeta });
  }

  return sessionCards;
}

function countHeldFromPool(
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
): number {
  const meaningCards = pool.filter((card) => isMeaningRecallTaskId(card.taskId));
  return countHeldMeaningRecall(meaningCards, tasksByTaskId);
}
