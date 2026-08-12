import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { buildVocabularySnapshot, type VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";

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

  return {
    status: "ok",
    snapshot: buildVocabularySnapshot(cards, tasksByTaskId, now),
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
