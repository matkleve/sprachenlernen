import { listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { poolForDisplay } from "@/lib/db/learner-pools";
import { buildVocabularySnapshot, type VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import type { Review } from "@/lib/scheduler";

/**
 * Loads the Words home snapshot for the signed-in learner. Contract:
 * docs/specs/feature/words-home.md
 */

export type WordsHomeOutcome =
  /** Signed in, no language chosen — the page routes to the picker. */
  | { status: "no-language" }
  | { status: "ok"; snapshot: VocabularySnapshot }
  | { status: "error"; error: HandledError };

export async function readWordsHome(now: number = Date.now()): Promise<WordsHomeOutcome> {
  try {
    return await read(now);
  } catch (cause) {
    return { status: "error", error: fail(cause) };
  }
}

async function read(now: number): Promise<WordsHomeOutcome> {
  // The language in focus, not every language being learned: UC-025 keeps
  // vocabulary and calibration per language, never pooled, so a figure summed
  // across two languages would be a number about neither.
  const pool = await poolForDisplay();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") {
    return { status: "error", error: fail(new Error(pool.error)) };
  }

  const cards = pool.cards;
  const reviewsResult = await listReviewsForTaskIds(cards.map((card) => card.taskId));
  if (reviewsResult.status === "error") {
    return { status: "error", error: fail(new Error(reviewsResult.error)) };
  }

  const reviewsByTaskId: Record<string, Review[]> = {};
  for (const row of reviewsResult.reviews) {
    (reviewsByTaskId[row.taskId] ??= []).push(toSchedulerReview(row));
  }

  return {
    status: "ok",
    snapshot: buildVocabularySnapshot(cards, reviewsByTaskId, now),
  };
}

function fail(cause: unknown): HandledError {
  const error = internalUnexpected(cause, {
    feature: "words",
    operation: "load your vocabulary snapshot",
  });
  logHandledError(error);
  return error;
}
