/**
 * Session queue builder. Contract: docs/specs/service/session-builder.md
 */

import type { StarterCard } from "@/lib/starter-deck";
import { newTask, type Task } from "@/lib/scheduler";

export type SessionCard = StarterCard & {
  position: number;
  total: number;
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
export function buildSession(
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
  now: number,
  sessionLength: number = DEFAULT_SESSION_LENGTH,
): SessionCard[] {
  const scored: ScoredCard[] = [];

  for (const card of pool) {
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
    .sort((a, b) => a.frequencyRank - b.frequencyRank);

  const picked = [...due, ...fresh].slice(0, sessionLength);
  const total = picked.length;

  return picked.map((card, index) => ({
    taskId: card.taskId,
    wordId: card.wordId,
    lemma: card.lemma,
    front: card.front,
    back: card.back,
    frequencyRank: card.frequencyRank,
    // Carried, not dropped: the front of a form card is only the meaning, so
    // without the cell the screen cannot say which form it is asking for.
    paradigmCell: card.paradigmCell,
    position: index + 1,
    total,
  }));
}
