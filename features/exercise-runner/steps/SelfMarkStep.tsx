"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function SelfMarkStep({
  step,
  submitDraft,
  markedErrorTokens,
  onToggleError,
}: Pick<StepRenderProps, "step" | "submitDraft" | "markedErrorTokens" | "onToggleError">) {
  const t = useTranslations("exerciseRunner");
  const isFeedback = step.component === "feedback";
  const answerKey =
    typeof step.config.answerKey === "string" && step.config.answerKey.length > 0
      ? step.config.answerKey
      : isFeedback
        ? submitDraft.text
        : "";
  const lines = answerKey.split("\n").filter(Boolean);
  const tokenGroups =
    lines.length > 1
      ? lines.map((line) => line.split(/\s+/).filter(Boolean))
      : [answerKey.split(/\s+/).filter(Boolean)];

  return (
    <div className="space-y-4">
      {isFeedback ? (
        <p className="text-sm text-muted">{t("feedbackPlaceholder")}</p>
      ) : null}
      <p className="text-sm font-medium text-ink">
        {isFeedback ? t("feedbackYourWriting") : t("reviewAnswerKey")}
      </p>
      {isFeedback && !answerKey.trim() ? (
        <p className="text-sm text-muted">{t("feedbackNoText")}</p>
      ) : lines.length > 1 ? (
        <div className="space-y-2">
          {lines.map((line) => (
            <p key={line} className="text-base text-ink">
              {line}
            </p>
          ))}
        </div>
      ) : answerKey.trim() ? (
        <p className="text-base text-ink">{answerKey}</p>
      ) : null}
      <p className="text-sm text-muted">{t("reviewMarkErrors")}</p>
      <div className="flex flex-wrap gap-2">
        {tokenGroups.flat().map((token, index) => {
          const selected = markedErrorTokens.includes(token);
          return (
            <Button
              key={`${token}-${index}`}
              type="button"
              variant={selected ? "primary" : "secondary"}
              size="sm"
              className="rounded-pill"
              onClick={() => onToggleError(token)}
            >
              {token}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
