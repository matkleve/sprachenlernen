"use client";

import { useTranslations } from "next-intl";

import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function PromptStep({
  step,
  listeningDeferred = false,
}: Pick<StepRenderProps, "step" | "listeningDeferred">) {
  const t = useTranslations("exerciseRunner");
  const body = typeof step.config.body === "string" ? step.config.body : "";

  return (
    <div className="space-y-2">
      {listeningDeferred ? (
        <p className="text-sm text-muted">{t("typeOnlyHint")}</p>
      ) : null}
      <p className="text-lg text-ink">{body}</p>
    </div>
  );
}
