"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

/** Guided debrief — optional stuck phrase; card offer is v1 placeholder. */
export function DebriefPromptStep({
  step,
  submitDraft,
  onTextChange,
  onDecline,
  onSelectOffer,
}: Pick<
  StepRenderProps,
  "step" | "submitDraft" | "onTextChange" | "onDecline" | "onSelectOffer"
>) {
  const t = useTranslations("exerciseRunner");
  const body =
    typeof step.config.body === "string" ? step.config.body : t("debriefDefault");
  const offerLabel =
    typeof step.config.offerLabel === "string" ? step.config.offerLabel : t("debriefOffer");

  return (
    <div className="space-y-4">
      <p className="text-lg leading-relaxed text-ink">{body}</p>
      <Field label={t("debriefStuckLabel")} description={t("debriefStuckHint")}>
        <Input
          value={submitDraft.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("debriefStuckPlaceholder")}
        />
      </Field>
      <Button type="button" className="w-full" onClick={onSelectOffer}>
        {offerLabel}
      </Button>
      <Button type="button" variant="secondary" className="w-full" onClick={onDecline}>
        {t("decline")}
      </Button>
    </div>
  );
}
