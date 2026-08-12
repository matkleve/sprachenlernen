import { listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { readVocabularySize } from "@/lib/level-model";
import { newTask, rebuild, type Review } from "@/lib/scheduler";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";

/**
 * Pool-local meaning-recall holdings per language. Contract:
 * docs/specs/page/language-picker.md, docs/specs/page/profile.md
 *
 * `heldCount` is null when the learner has never reviewed in that language —
 * the tile shows the pool size instead. Once any meaning-recall review exists,
 * zero is a real measurement.
 */

export type LanguageHoldings = {
  poolSize: number | null;
  heldCount: number | null;
};

export type LanguageHoldingsOutcome =
  | { status: "ok"; byCode: Record<string, LanguageHoldings> }
  | { status: "error"; error: string };

export async function readLanguageHoldings(
  languageCodes: readonly string[],
  now: number = Date.now(),
): Promise<LanguageHoldingsOutcome> {
  void now;
  const decks = languageCodes.map((code) => ({
    code,
    deck: loadMeaningRecallDeck(code),
  }));

  const byCode: Record<string, LanguageHoldings> = {};
  const cardsPerCode: Record<string, { taskId: string; wordId: string }[]> = {};
  const allTaskIds: string[] = [];

  for (const { code, deck } of decks) {
    if (deck.status !== "ok") {
      byCode[code] = { poolSize: null, heldCount: null };
      continue;
    }
    const cards = deck.deck.cards;
    cardsPerCode[code] = cards;
    byCode[code] = { poolSize: cards.length, heldCount: null };
    allTaskIds.push(...cards.map((card) => card.taskId));
  }

  if (allTaskIds.length === 0) {
    return { status: "ok", byCode };
  }

  const reviewsResult = await listReviewsForTaskIds(allTaskIds);
  if (reviewsResult.status === "error") {
    return { status: "error", error: reviewsResult.error };
  }

  const reviewsByTaskId: Record<string, Review[]> = {};
  for (const row of reviewsResult.reviews) {
    (reviewsByTaskId[row.taskId] ??= []).push(toSchedulerReview(row));
  }

  for (const code of languageCodes) {
    const cards = cardsPerCode[code];
    if (!cards) continue;

    const hasAnyReview = cards.some((card) => (reviewsByTaskId[card.taskId]?.length ?? 0) > 0);
    if (!hasAnyReview) continue;

    const tasks = cards.map((card) => {
      const reviews = reviewsByTaskId[card.taskId];
      if (!reviews || reviews.length === 0) return newTask(card.taskId, card.wordId);
      return rebuild(card.taskId, card.wordId, reviews).task;
    });

    const vocabulary = readVocabularySize(tasks);
    byCode[code] = {
      poolSize: cards.length,
      heldCount:
        vocabulary.status === "has-data" && vocabulary.value !== null ? vocabulary.value : 0,
    };
  }

  return { status: "ok", byCode };
}
