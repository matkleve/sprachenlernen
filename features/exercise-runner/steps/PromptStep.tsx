"use client";

import { useTranslations } from "next-intl";

import { practiceLeadClass } from "@/features/exercise-runner/practice-surface/PracticeSurface";

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
      <p className={practiceLeadClass}>{body}</p>
    </div>
  );
}
