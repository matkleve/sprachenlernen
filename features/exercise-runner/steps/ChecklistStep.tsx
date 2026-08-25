"use client";

import { useTranslations } from "next-intl";

import {
  PracticePrepList,
  type PracticePrepEntry,
} from "@/features/exercise-runner/practice-surface/PracticePrepList";
import { practiceLeadClass } from "@/features/exercise-runner/practice-surface/PracticeSurface";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";
import { cn } from "@/lib/utils";

function readItemKeys(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.itemKeys)) return [];
  return config.itemKeys.filter((entry): entry is string => typeof entry === "string");
}

export function ChecklistStep({ step }: Pick<StepRenderProps, "step">) {
  const t = useTranslations("exerciseRunner");
  const introKey =
    typeof step.config.introKey === "string" ? step.config.introKey : undefined;
  const itemKeys = readItemKeys(step.config);
  const entries: PracticePrepEntry[] = itemKeys.map((key) => ({
    id: key,
    label: t(key as "prepareItemKeyboard"),
  }));

  return (
    <div className="space-y-4">
      {introKey ? (
        <p className={cn(practiceLeadClass, "max-md:line-clamp-3")}>
          {t(introKey as "introBuildASentence")}
        </p>
      ) : null}
      <PracticePrepList entries={entries} />
    </div>
  );
}
