import { readVocabularySize } from "@/lib/level-model";
import { newTask, type Task } from "@/lib/scheduler";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";

import { readActiveMeaningRecall } from "./readActiveMeaningRecall";
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
  const recall = await readActiveMeaningRecall();
  if (recall.status === "no-language") return { status: "no-language" };
  if (recall.status === "error" || recall.status === "states-error") return { status: "omit" };

  const { cards, stateRows } = recall;
  const tasksByTaskId = tasksByTaskIdForCards(cards, stateRows);
  const tasks: Task[] = cards.map(
    (card) => tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId),
  );

  void now;
  return { status: "ok", summary: standingFromVocabulary(readVocabularySize(tasks)) };
}
