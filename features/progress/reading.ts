import { listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { readLevel, type LevelReading } from "@/lib/level-model";
import { newTask, rebuild, type Review, type Task } from "@/lib/scheduler";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";

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
  /** Signed in, no language chosen — the page routes to the picker. */
  | { status: "no-language" }
  | { status: "ok"; reading: LevelReading }
  | { status: "error"; error: HandledError };

export async function readProgress(now: number = Date.now()): Promise<ProgressOutcome> {
  // The adapter returns its failures, but it does not promise never to throw:
  // a rejected fetch inside supabase-js, or a missing environment, arrives as
  // an exception and would take the whole route to an unhandled 500 — the
  // "Error: An error occurred" archetype UC-065 exists to stop. Everything
  // below is inside this boundary so the page has exactly two outcomes.
  try {
    return await read(now);
  } catch (cause) {
    return { status: "error", error: fail(cause) };
  }
}

async function read(now: number): Promise<ProgressOutcome> {
  // The language in focus, not every language being learned: UC-025 keeps
  // vocabulary and calibration per language, never pooled, so a figure summed
  // across two languages would be a number about neither.
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") {
    return { status: "error", error: fail(new Error(pool.error)) };
  }

  const cards = pool.cards;
  const reviewsResult = await listReviewsForTaskIds(cards.map((card) => card.taskId));
  if (reviewsResult.status === "error") {
    // Not an empty reading. A failed read and a learner who has done nothing
    // look the same on this page — "nothing measured" — and only one of them
    // is true, so the failure has to be loud (UC-066).
    return { status: "error", error: fail(new Error(reviewsResult.error)) };
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

function fail(cause: unknown): HandledError {
  const error = internalUnexpected(cause, {
    feature: "progress",
    operation: "load your review history",
  });
  logHandledError(error);
  return error;
}
