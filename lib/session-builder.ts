/**
 * Session queue builder. Contract: docs/specs/service/session-builder.md
 */

import { isFormRecallTaskId, isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { ReviewDeck } from "@/lib/review-deck";
import type { StarterCard } from "@/lib/starter-deck";
import { newTask, type Task } from "@/lib/scheduler";
import type { FormCellExplanationData } from "@/lib/form-cell-explanation";

export type SessionCard = StarterCard & {
  position: number;
  total: number;
  /** Populated on form-recall cards when a rule exists — UC-022 / T-W21. */
  formExplanation?: FormCellExplanationData;
};

export const DEFAULT_SESSION_LENGTH = 15;

type ScoredCard = StarterCard & { due: number; isNew: boolean };

function isSchedulable(task: Task, now: number): "due" | "new" | "skip" {
  if (task.state === "suspended" || task.state === "retired") return "skip";
  if (task.reviews.length === 0) return "new";
  if (task.due <= now) return "due";
  return "skip";
}

/**
 * Builds a fixed-length session from the starter pool and optional review
 * history. Pure — callers supply `now` for testability (scheduler contract).
 */
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
  options?: { priorityLemmas?: ReadonlySet<string>; deck?: ReviewDeck },
): SessionCard[] {
  const deck = options?.deck ?? "mixed";
  const filteredPool = poolForDeck(pool, deck);
  const scored: ScoredCard[] = [];

  for (const card of filteredPool) {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    const bucket = isSchedulable(task, now);
    if (bucket === "skip") continue;
    scored.push({
      ...card,
      due: task.due,
      isNew: bucket === "new",
    });
  }

  const due = scored
    .filter((card) => !card.isNew)
    .sort((a, b) => a.due - b.due || a.frequencyRank - b.frequencyRank);
  const fresh = scored
    .filter((card) => card.isNew)
    .sort((a, b) => {
      const aPriority = options?.priorityLemmas?.has(a.lemma) ? 0 : 1;
      const bPriority = options?.priorityLemmas?.has(b.lemma) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.frequencyRank - b.frequencyRank;
    });

  const picked: ScoredCard[] = [];
  const seenWordIds = new Set<string>();

  for (const card of [...due, ...fresh]) {
    if (picked.length >= sessionLength) break;
    // At most one Task per Word per session — siblings stay due for the next run.
    if (seenWordIds.has(card.wordId)) continue;
    seenWordIds.add(card.wordId);
    picked.push(card);
  }
  const total = picked.length;

  return picked.map((card, index) => ({
    taskId: card.taskId,
    wordId: card.wordId,
    lemma: card.lemma,
    front: card.front,
    descriptionKey: card.descriptionKey,
    back: card.back ?? "",
    frequencyRank: card.frequencyRank,
    // Carried, not dropped: the front of a form card is only the meaning, so
    // without the cell the screen cannot say which form it is asking for.
    paradigmCell: card.paradigmCell,
    position: index + 1,
    total,
  }));
}
