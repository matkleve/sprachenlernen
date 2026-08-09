/**
 * Session queue builder. Contract: docs/specs/service/session-builder.md
 */

import type { StarterCard } from "@/lib/starter-deck";
import { newTask, rebuild, type Review, type Task } from "@/lib/scheduler";

export type SessionCard = StarterCard & {
  position: number;
  total: number;
};

export const DEFAULT_SESSION_LENGTH = 15;

type ScoredCard = StarterCard & { due: number; isNew: boolean };

function taskFromReviews(card: StarterCard, reviews: Review[]): Task {
  if (reviews.length === 0) {
    return newTask(card.taskId, card.wordId);
  }
  return rebuild(card.taskId, card.wordId, reviews).task;
}

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
  reviewsByTaskId: Record<string, Review[]>,
  now: number,
  sessionLength: number = DEFAULT_SESSION_LENGTH,
): SessionCard[] {
  const scored: ScoredCard[] = [];

  for (const card of pool) {
    const reviews = reviewsByTaskId[card.taskId] ?? [];
    const task = taskFromReviews(card, reviews);
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
    position: index + 1,
    total,
  }));
}
