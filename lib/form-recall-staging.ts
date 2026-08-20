/**
 * Schedulable pool filter before session sampling. Contract:
 * docs/specs/service/form-recall-pool.md
 *
 * Hard meaning-held gate removed when T-W22 shipped — form staging weight `fᵢ`
 * in session-sampling down-weights early form cards instead.
 */

import type { StarterCard } from "@/lib/starter-deck";
import { newTask, type Task } from "@/lib/scheduler";

/**
 * Drops suspended/retired tasks. Form-recall no longer waits for held meaning —
 * sampling assigns soft `fᵢ` instead.
 */
export function filterSchedulableCards(
  cards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
): StarterCard[] {
  return cards.filter((card) => {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    return task.state !== "suspended" && task.state !== "retired";
  });
}
