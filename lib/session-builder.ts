/**
 * Session queue builder. Contract: docs/specs/service/session-builder.md
 */

import { isFormRecallTaskId, isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { cardCountForBudgetMinutes } from "@/lib/exercise-recipe/budget";
import type { ReviewDeck } from "@/lib/review-deck";
import {
  isSamplingCandidate,
  sampleSession,
  type SamplingContext,
  type SamplingReason,
} from "@/lib/session-sampling";
import type { StarterCard } from "@/lib/starter-deck";
import { newTask, type Task } from "@/lib/scheduler";
import type { FormCellExplanationData } from "@/lib/form-cell-explanation";

export type ExampleSentenceOnCard = {
  id: string;
  text: string;
  translation: string;
};

export type SessionCard = StarterCard & {
  position: number;
  total: number;
  /** Populated on form-recall cards when a rule exists — UC-022 / T-W21. */
  formExplanation?: FormCellExplanationData;
  /** Dominant sampling factor — UC-005 / T-W22. */
  samplingReason?: SamplingReason;
  /** Target-language example sentence — UC-076 / T-W25. */
  exampleSentence?: ExampleSentenceOnCard;
};

export const DEFAULT_SESSION_LENGTH = 15;

export function sessionLengthForBudgetMinutes(budgetMinutes: number): number {
  return cardCountForBudgetMinutes(budgetMinutes);
}

type BuildSessionOptions = {
  priorityLemmas?: ReadonlySet<string>;
  deck?: ReviewDeck;
  sampling: SamplingContext;
};

function poolForDeck(pool: StarterCard[], deck: ReviewDeck): StarterCard[] {
  if (deck === "form") {
    return pool.filter((card) => isFormRecallTaskId(card.taskId));
  }
  if (deck === "meaning") {
    return pool.filter((card) => isMeaningRecallTaskId(card.taskId));
  }
  return pool;
}

export function buildSession(
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
  now: number,
  sessionLength: number = DEFAULT_SESSION_LENGTH,
  options: BuildSessionOptions,
): SessionCard[] {
  const deck = options.deck ?? "mixed";
  const filteredPool = poolForDeck(pool, deck);
  const candidates: { card: StarterCard; task: Task; isNew: boolean }[] = [];

  for (const card of filteredPool) {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    const bucket = isSamplingCandidate(task);
    if (bucket === "skip") continue;
    candidates.push({ card, task, isNew: bucket === "new" });
  }

  const samplingContext: SamplingContext = {
    ...options.sampling,
    now,
    rng: options.sampling.rng,
  };

  let picked = sampleSession({
    candidates,
    context: samplingContext,
    sessionLength,
  });

  if (options.priorityLemmas && options.priorityLemmas.size > 0) {
    const priority = options.priorityLemmas;
    const priorityCandidates = candidates.filter((entry) => priority.has(entry.card.lemma));
    if (priorityCandidates.length > 0) {
      const forced = sampleSession({
        candidates: priorityCandidates,
        context: samplingContext,
        sessionLength: Math.min(sessionLength, priorityCandidates.length),
      });
      const forcedIds = new Set(forced.map((entry) => entry.card.taskId));
      picked = [
        ...forced,
        ...picked.filter((entry) => !forcedIds.has(entry.card.taskId)),
      ].slice(0, sessionLength);
    }
  }

  const total = picked.length;

  return picked.map((entry, index) => ({
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
    samplingReason: entry.reason,
  }));
}
