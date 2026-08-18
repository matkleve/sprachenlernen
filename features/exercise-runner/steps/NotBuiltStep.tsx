"use client";

import { useTranslations } from "next-intl";

import { resolveStepComponentId } from "@/lib/exercise-step-components";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function NotBuiltStep({ step }: Pick<StepRenderProps, "step">) {
  const t = useTranslations("exerciseRunner");
  const componentId = resolveStepComponentId(step);

  return (
    <p className="text-base text-muted">
      {t("unknownComponent", { component: componentId })}
    </p>
  );
}
