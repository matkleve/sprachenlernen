/**
 * Server-side practice context — held lemmas for gap selection.
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { heldLemmaSet } from "@/lib/content-gap";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";

export async function loadPracticeHeldLemmas(): Promise<ReadonlySet<string>> {
  try {
    const pool = await poolForActiveLanguage();
    if (pool.status !== "ok") return new Set();

    const meaningCards = pool.cards.filter((card) => isMeaningRecallTaskId(card.taskId));
    if (meaningCards.length === 0) return new Set();

    const statesResult = await listTaskStatesForTaskIds(meaningCards.map((card) => card.taskId));
    if (statesResult.status === "error") return new Set();

    const tasksByTaskId = tasksByTaskIdForCards(meaningCards, statesResult.rows);
    return heldLemmaSet(meaningCards, tasksByTaskId);
  } catch {
    return new Set();
  }
}
