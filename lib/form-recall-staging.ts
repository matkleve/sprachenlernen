/**
 * Staging gate for form-recall Tasks. Contract:
 * docs/specs/service/form-recall-pool.md
 */

import {
  isFormRecallTaskId,
  meaningRecallTaskIdFor,
} from "@/lib/form-recall-pool";
import type { StarterCard } from "@/lib/starter-deck";
import { rebuild, type Review } from "@/lib/scheduler";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";

/**
 * Form-recall Tasks enter the schedulable pool only when meaning-recall for the
 * same Word is held. Meaning-recall and all other task types pass through.
 */
export function filterSchedulableCards(
  cards: readonly StarterCard[],
  reviewsByTaskId: Record<string, Review[]>,
): StarterCard[] {
  return cards.filter((card) => {
    if (!isFormRecallTaskId(card.taskId)) return true;

    const meaningId = meaningRecallTaskIdFor(card);
    const reviews = reviewsByTaskId[meaningId] ?? [];
    if (reviews.length === 0) return false;

    const meaningTask = rebuild(meaningId, card.wordId, reviews).task;

    return isTaskHeld(meaningTask);
  });
}
