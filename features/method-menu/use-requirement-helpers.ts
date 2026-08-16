"use client";

import { useMemo } from "react";

import type { RequirementSet, Requirements } from "@/lib/method-catalogue";

import { useMethodMenuCopy } from "./use-method-menu-copy";

/**
 * Turns a Method's context requirements into words. Contract:
 * docs/specs/page/method-menu.md
 */
export function useRequirementHelpers() {
  const { t, dimensionOrder, dimensionValues } = useMethodMenuCopy();

  return useMemo(() => {
    function labelsForSet(set: RequirementSet): string[] {
      return dimensionOrder.flatMap((dimension) => {
        const values = set[dimension];
        if (!values?.length) return [];
        const labels = dimensionValues[dimension] as Record<string, string>;
        return values.map((value) => labels[value] ?? value);
      });
    }

    function requirementChips(requires: Requirements): string[] {
      const sets = Array.isArray(requires) ? requires : [requires as RequirementSet];
      return [...new Set(sets.flatMap(labelsForSet))];
    }

    function describeRequirements(requires: Requirements): string[] {
      const sets = Array.isArray(requires) ? requires : [requires as RequirementSet];
      return sets
        .map((set) =>
          dimensionOrder
            .filter((dimension) => (set[dimension]?.length ?? 0) > 0)
            .map((dimension) => {
              const values = set[dimension] as readonly string[];
              const labels = dimensionValues[dimension] as Record<string, string>;
              return values.map((value) => labels[value]).join(` ${t("or")} `);
            })
            .join(" · "),
        )
        .filter((described) => described.length > 0);
    }

    function formatDurationLabel(durations: number[] | null): string {
      if (durations === null || durations.length === 0) return t("card.openEnded");
      if (durations.length === 1) return `${durations[0]} ${t("minutes")}`;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      if (min === max) return `${min} ${t("minutes")}`;
      return `${min}–${max} ${t("minutes")}`;
    }

    function durationChips(durations: number[] | null): string[] {
      return [formatDurationLabel(durations)];
    }

    return {
      requirementChips,
      describeRequirements,
      formatDurationLabel,
      durationChips,
    };
  }, [dimensionOrder, dimensionValues, t]);
}
