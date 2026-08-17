import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { buildFrequencyBlocks, type FrequencyBlock } from "@/lib/frequency-blocks";
import { buildHorizonDisplay, type HorizonDisplay } from "@/lib/review-horizon";
import { newTask } from "@/lib/scheduler";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";
import { buildVocabularySnapshot, type VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import type { ContentTraceIndex } from "@/lib/content-traceability";
import { loadContentTraceIndex } from "@/features/words/content-trace-reading";

/**
 * Loads the Words home snapshot for the signed-in learner. Contract:
 * docs/specs/feature/words-home.md
 */

export type WordsHomeOutcome =
  /** Signed in, no language chosen — the page routes to the picker. */
  | { status: "no-language" }
  | {
      status: "ok";
      snapshot: VocabularySnapshot;
      blocks: readonly FrequencyBlock[];
      languageCode: string;
      translations: Readonly<Record<string, string>>;
      horizonDisplay: HorizonDisplay;
      now: number;
      contentTraceIndex: ContentTraceIndex | null;
    }
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
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") {
    return { status: "error", error: fail(new Error(pool.error)) };
  }

  // poolForActiveLanguage carries meaning-recall and form-recall cards
  // together, for the review session's benefit — but this atlas is "one row
  // per word", and a lemma with a distinct form would otherwise contribute
  // two rows at the same frequencyRank, pushing lower-ranked words out of the
  // capped top-100 view entirely (a real bug, not a hypothetical: verified it
  // drops the visible atlas from 100 to 62 distinct lemmas on the shipped
  // Spanish pool). vocabulary-snapshot.md's own acceptance criterion — "counts
  // sum to the deck size" — only holds for one deck.
  const cards = pool.cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  const statesResult = await listTaskStatesForTaskIds(cards.map((card) => card.taskId));
  if (statesResult.status === "error") {
    return { status: "error", error: fail(new Error(statesResult.error)) };
  }

  const tasksByTaskId = tasksByTaskIdForCards(cards, statesResult.rows);
  const translations = Object.fromEntries(cards.map((card) => [card.lemma, card.back]));

  const reviewsResult = await listReviewsForTaskIds(cards.map((card) => card.taskId));
  if (reviewsResult.status === "error") {
    return { status: "error", error: fail(new Error(reviewsResult.error)) };
  }

  const reviewTimestamps: number[] = [];
  const firstReviewByTaskId = new Map<string, number>();
  for (const row of reviewsResult.reviews) {
    const at = Date.parse(row.reviewedAt);
    reviewTimestamps.push(at);
    const previous = firstReviewByTaskId.get(row.taskId);
    if (previous === undefined || at < previous) {
      firstReviewByTaskId.set(row.taskId, at);
    }
  }

  const snapshot = buildVocabularySnapshot(cards, tasksByTaskId, now);
  const taskHorizonMeta = cards.map((card) => {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    return {
      taskId: card.taskId,
      due: task.due,
      firstReviewAt: firstReviewByTaskId.get(card.taskId) ?? null,
    };
  });

  return {
    status: "ok",
    snapshot,
    blocks: buildFrequencyBlocks(cards, tasksByTaskId),
    languageCode: pool.languageCodes[0] ?? "es",
    translations,
    horizonDisplay: buildHorizonDisplay(snapshot.horizon, now, {
      reviewTimestamps,
      firstReviewByTaskId,
    }, taskHorizonMeta),
    now,
    contentTraceIndex: loadContentTraceIndex(pool.languageCodes[0] ?? "es"),
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
