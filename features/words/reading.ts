import { listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
import { buildVocabularySnapshot, type VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import type { Review } from "@/lib/scheduler";

/**
 * Loads the Words home snapshot for the signed-in learner. Contract:
 * docs/specs/feature/words-home.md
 */

export type WordsHomeOutcome =
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
  const deckResult = loadSpanishMeaningRecallDeck();
  if (deckResult.status === "error") {
    return { status: "error", error: fail(new Error(deckResult.errors.join("; "))) };
  }

  const cards = deckResult.deck.cards;
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
