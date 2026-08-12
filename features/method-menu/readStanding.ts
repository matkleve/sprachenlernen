import { listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { readVocabularySize } from "@/lib/level-model";
import { newTask, rebuild, type Review, type Task } from "@/lib/scheduler";

import { standingFromVocabulary, type StandingOutcome } from "./standing";

/**
 * Loads current standing for `/methods`. Contract:
 * docs/specs/page/method-menu.md § Current standing.
 *
 * Loads meaning-recall history only — standing needs the vocabulary-size
 * signal, not form-recall or the other progress signals. Calling
 * `readProgress()` here was loading the entire pool twice on every visit to
 * the front door.
 */
export async function readStanding(now: number = Date.now()): Promise<StandingOutcome> {
  try {
    return await read(now);
  } catch {
    return { status: "omit" };
  }
}

async function read(now: number): Promise<StandingOutcome> {
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") return { status: "omit" };

  const cards = pool.cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  const reviewsResult = await listReviewsForTaskIds(cards.map((card) => card.taskId));
  if (reviewsResult.status === "error") return { status: "omit" };

  const reviewsByTaskId: Record<string, Review[]> = {};
  for (const row of reviewsResult.reviews) {
    (reviewsByTaskId[row.taskId] ??= []).push(toSchedulerReview(row));
  }

  const tasks: Task[] = cards.map((card) => {
    const reviews = reviewsByTaskId[card.taskId];
    if (!reviews || reviews.length === 0) return newTask(card.taskId, card.wordId);
    return rebuild(card.taskId, card.wordId, reviews).task;
  });

  void now;
  return { status: "ok", summary: standingFromVocabulary(readVocabularySize(tasks)) };
}
