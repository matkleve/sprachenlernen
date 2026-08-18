"use client";

import { useTranslations } from "next-intl";

import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

/** Honest self-report after off-screen work — contract: exercise-step-components.md */
export function ConfirmDoneStep({ step }: Pick<StepRenderProps, "step">) {
  const t = useTranslations("exerciseRunner");
  const body =
    typeof step.config.body === "string" ? step.config.body : t("confirmDoneDefault");

  return (
    <div className="space-y-2">
      <p className="text-lg leading-relaxed text-ink">{body}</p>
      <p className="text-sm text-muted">{t("confirmDoneHint")}</p>
    </div>
  );
}
