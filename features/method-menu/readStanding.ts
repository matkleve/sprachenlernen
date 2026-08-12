import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { readVocabularySize } from "@/lib/level-model";
import { newTask, type Task } from "@/lib/scheduler";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";

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
  const statesResult = await listTaskStatesForTaskIds(cards.map((card) => card.taskId));
  if (statesResult.status === "error") return { status: "omit" };

  const tasksByTaskId = tasksByTaskIdForCards(cards, statesResult.rows);
  const tasks: Task[] = cards.map(
    (card) => tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId),
  );

  void now;
  return { status: "ok", summary: standingFromVocabulary(readVocabularySize(tasks)) };
}
