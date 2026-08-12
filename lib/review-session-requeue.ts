/**
 * Same-session requeue after a grade. Contract:
 * docs/adr/0012-ux-decisions-requeue-i18n-leech-nav.md (decision 13),
 * UC-071.
 *
 * Framework-free — consumed by the review-session client hook.
 */

import type { Grade } from "@/lib/scheduler";

/** How many distinct cards to show before an `again` repeat, when possible. */
export const AGAIN_REQUEUE_AHEAD = 5;

/**
 * Where to splice a copy of the current card back into the queue after a poor
 * grade, or `null` when the card is done for this run.
 *
 * `sessionIndex` is the index just graded; insertion is into the queue *before*
 * the hook advances to `sessionIndex + 1`.
 */
export function requeueInsertIndex(
  sessionIndex: number,
  queueLength: number,
  grade: Grade,
): number | null {
  if (grade === "good" || grade === "easy") return null;
  if (grade === "hard") return queueLength;
  // again — five other cards before the repeat, when the queue is long enough
  const insertAt = sessionIndex + 1 + AGAIN_REQUEUE_AHEAD;
  return insertAt >= queueLength ? queueLength : insertAt;
}
