import { listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { readLevel, type LevelReading } from "@/lib/level-model";
import { newTask, rebuild, type Review, type Task } from "@/lib/scheduler";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";

/**
 * Assembles the progress reading for the signed-in learner. Contract:
 * docs/specs/page/progress.md
 *
 * Lives here rather than in `lib/` because it touches the database, and `lib/`
 * is I/O-free by construction — same split and same reason as
 * features/method-menu/catalogue.ts.
 *
 * It reads history for the **starter deck's** task ids rather than for
 * everything the learner owns, because the deck is the only content that
 * exists. When a second deck ships, this is the line that has to change, and
 * it will be obvious: a card the learner reviewed would stop appearing in the
 * derivation.
 */

export type ProgressOutcome =
  | { status: "ok"; reading: LevelReading }
  | { status: "error"; error: HandledError };

export async function readProgress(now: number = Date.now()): Promise<ProgressOutcome> {
  const deckResult = loadSpanishMeaningRecallDeck();
  if (deckResult.status === "error") {
    return { status: "error", error: fail(deckResult.errors.join("; ")) };
  }

  const cards = deckResult.deck.cards;
  const reviewsResult = await listReviewsForTaskIds(cards.map((card) => card.taskId));
  if (reviewsResult.status === "error") {
    // Not an empty reading. A failed read and a learner who has done nothing
    // look the same on this page — "nothing measured" — and only one of them
    // is true, so the failure has to be loud (UC-066).
    return { status: "error", error: fail(reviewsResult.error) };
  }

  const reviewsByTaskId: Record<string, Review[]> = {};
  for (const row of reviewsResult.reviews) {
    (reviewsByTaskId[row.taskId] ??= []).push(toSchedulerReview(row));
  }

  const tasks: Task[] = cards.map((card) => {
    const reviews = reviewsByTaskId[card.taskId];
    if (!reviews || reviews.length === 0) return newTask(card.taskId, card.wordId);
    return rebuild(card.taskId, card.wordId, reviews).task;
  });

  return { status: "ok", reading: readLevel(tasks, now) };
}

function fail(details: string): HandledError {
  const error = internalUnexpected(new Error(details), {
    feature: "progress",
    operation: "load your review history",
  });
  logHandledError(error);
  return error;
}
