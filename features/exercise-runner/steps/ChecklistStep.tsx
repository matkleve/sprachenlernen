"use client";

import { useTranslations } from "next-intl";

import {
  PracticePrepList,
  type PracticePrepEntry,
} from "@/features/exercise-runner/practice-surface/PracticePrepList";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

function readItemKeys(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.itemKeys)) return [];
  return config.itemKeys.filter((entry): entry is string => typeof entry === "string");
}

function readLegacyItems(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.items)) return [];
  return config.items.filter((entry): entry is string => typeof entry === "string");
}

export function ChecklistStep({ step }: Pick<StepRenderProps, "step">) {
  const t = useTranslations("exerciseRunner");
  const introKey =
    typeof step.config.introKey === "string" ? step.config.introKey : undefined;
  const itemKeys = readItemKeys(step.config);
  const entries: PracticePrepEntry[] =
    itemKeys.length > 0
      ? itemKeys.map((key) => ({ id: key, label: t(key as "prepareItemKeyboard") }))
      : readLegacyItems(step.config).map((label, index) => ({
          id: `${step.id}-${index}`,
          label,
        }));

  return (
    <div className="space-y-5">
      {introKey ? (
        <p className="text-xl font-medium leading-snug text-ink">
          {t(introKey as "introBuildASentence")}
        </p>
      ) : null}
      <PracticePrepList entries={entries} />
    </div>
  );
}
