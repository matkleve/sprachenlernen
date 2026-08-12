import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { readVocabularySize } from "@/lib/level-model";
import { newTask } from "@/lib/scheduler";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";

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

  const statesResult = await listTaskStatesForTaskIds(allTaskIds);
  if (statesResult.status === "error") {
    return { status: "error", error: statesResult.error };
  }

  const rowByTaskId = new Map(statesResult.rows.map((row) => [row.taskId, row]));

  for (const code of languageCodes) {
    const cards = cardsPerCode[code];
    if (!cards) continue;

    const hasAnyReview = cards.some((card) => rowByTaskId.has(card.taskId));
    if (!hasAnyReview) continue;

    const tasksByTaskId = tasksByTaskIdForCards(cards, statesResult.rows);
    const tasks = cards.map(
      (card) => tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId),
    );

    const vocabulary = readVocabularySize(tasks);
    byCode[code] = {
      poolSize: cards.length,
      heldCount:
        vocabulary.status === "has-data" && vocabulary.value !== null ? vocabulary.value : 0,
    };
  }

  return { status: "ok", byCode };
}
