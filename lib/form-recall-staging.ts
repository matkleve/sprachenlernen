/**
 * Staging gate for form-recall Tasks. Contract:
 * docs/specs/service/form-recall-pool.md
 */

import {
  isFormRecallTaskId,
  meaningRecallTaskIdFor,
} from "@/lib/form-recall-pool";
import type { StarterCard } from "@/lib/starter-deck";
import { newTask, type Task } from "@/lib/scheduler";
import { bucketForTask } from "@/lib/vocabulary-snapshot";

/**
 * Form-recall Tasks enter the schedulable pool only when meaning-recall for the
 * same Word is held. Meaning-recall and all other task types pass through.
 */
export function filterSchedulableCards(
  cards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
): StarterCard[] {
  return cards.filter((card) => {
    if (!isFormRecallTaskId(card.taskId)) return true;

    const meaningId = meaningRecallTaskIdFor(card);
    const meaningTask = tasksByTaskId[meaningId] ?? newTask(meaningId, card.wordId);
    if (meaningTask.reviews.length === 0) return false;

    return bucketForTask(meaningTask) === "held";
  });
}
