// Legacy English copy — use next-intl messages instead. Kept for reference during migration.
import type { RequirementSet, Requirements } from "@/lib/method-catalogue";

import { copy, dimensionOrder, dimensionValues } from "./content";

/**
 * Turns a Method's context requirements into words. Contract:
 * docs/specs/page/method-menu.md
 */

function labelsForSet(set: RequirementSet): string[] {
  return dimensionOrder.flatMap((dimension) => {
    const values = set[dimension];
    if (!values?.length) return [];
    const labels = dimensionValues[dimension] as Record<string, string>;
    return values.map((value) => labels[value] ?? value);
  });
}

/** Every requirement value as its own chip label. OR-sets are flattened. */
export function requirementChips(requires: Requirements): string[] {
  const sets = Array.isArray(requires) ? requires : [requires as RequirementSet];
  return [...new Set(sets.flatMap(labelsForSet))];
}

export function describeRequirements(requires: Requirements): string[] {
  const sets = Array.isArray(requires) ? requires : [requires as RequirementSet];
  return sets
    .map((set) =>
      dimensionOrder
        .filter((dimension) => (set[dimension]?.length ?? 0) > 0)
        .map((dimension) => {
          const values = set[dimension] as readonly string[];
          const labels = dimensionValues[dimension] as Record<string, string>;
          return values.map((value) => labels[value]).join(` ${copy.or} `);
        })
        .join(" · "),
    )
    .filter((described) => described.length > 0);
}

export function durationChips(durations: number[] | null): string[] {
  const label = formatDurationLabel(durations);
  return [label];
}

/** One chip label for duration — range when multiple session lengths exist. */
export function formatDurationLabel(durations: number[] | null): string {
  if (durations === null || durations.length === 0) return copy.card.openEnded;
  if (durations.length === 1) return `${durations[0]} ${copy.minutes}`;
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  if (min === max) return `${min} ${copy.minutes}`;
  return `${min}–${max} ${copy.minutes}`;
}
