import type { Dimension, RequirementSet, Requirements } from "@/lib/method-catalogue";

import { copy, dimensionOrder, dimensionValues } from "./content";

/**
 * Turns a Method's context requirements into words. Contract:
 * docs/specs/page/method-menu.md
 *
 * The catalogue stores requirements as data because that is what a filter can
 * use; a learner reading a card needs a sentence. This only names the values
 * the catalogue already ships — it decides nothing about what a Method needs.
 *
 * A set is AND across dimensions and OR within one; an array of sets is OR
 * across the sets, which is why this returns one string per alternative rather
 * than one string.
 */

function describeSet(set: RequirementSet): string {
  return dimensionOrder
    .filter((dimension) => (set[dimension]?.length ?? 0) > 0)
    .map((dimension: Dimension) => {
      const values = set[dimension] as readonly string[];
      const labels = dimensionValues[dimension] as Record<string, string>;
      return values.map((value) => labels[value]).join(` ${copy.or} `);
    })
    .join(" · ");
}

export function describeRequirements(requires: Requirements): string[] {
  const sets = Array.isArray(requires) ? requires : [requires as RequirementSet];
  return sets.map(describeSet).filter((described) => described.length > 0);
}

/** Minutes as the card says them: "10, 20 or 45 min", or the open-ended line. */
export function describeDurations(durations: number[] | null): string {
  if (durations === null || durations.length === 0) return copy.card.openEnded;
  if (durations.length === 1) return `${durations[0]} ${copy.minutes}`;

  const last = durations[durations.length - 1];
  return `${durations.slice(0, -1).join(", ")} ${copy.or} ${last} ${copy.minutes}`;
}
