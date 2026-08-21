/**
 * Staging gate for form-recall Tasks. Contract:
 * docs/specs/service/form-recall-pool.md
 *
 * T-W22: hard held-gate removed — form staging weights live in session-sampling.
 */

import type { StarterCard } from "@/lib/starter-deck";

/** Pass-through — sampling down-weights form tasks until meaning succeeds. */
export function filterSchedulableCards(cards: readonly StarterCard[]): StarterCard[] {
  return [...cards];
}
