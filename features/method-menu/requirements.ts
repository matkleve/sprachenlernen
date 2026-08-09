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
  if (durations === null || durations.length === 0) return [copy.card.openEnded];
  return durations.map((minutes) => `${minutes} ${copy.minutes}`);
}

/** @deprecated Use durationChips — kept for any external callers. */
export function describeDurations(durations: number[] | null): string {
  const chips = durationChips(durations);
  if (chips.length === 1) return chips[0]!;
  return `${chips.slice(0, -1).join(", ")} ${copy.or} ${chips[chips.length - 1]}`;
}
