"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { SessionFindingsRecap } from "@/features/exercise-runner/steps/SessionFindingsRecap";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function SummaryStep({
  step,
  sessionFindings,
  onDecline,
  onSelectOffer,
}: Pick<StepRenderProps, "step" | "sessionFindings" | "onDecline" | "onSelectOffer">) {
  const t = useTranslations("exerciseRunner");
  const recap = sessionFindings.checked > 0 || sessionFindings.unavailable > 0;
  // A session that was checked describes itself; the static body would only
  // repeat "Durchlauf abgeschlossen" above a real account of what happened.
  const body = typeof step.config.body === "string" ? step.config.body : t("summaryDefault");
  const offers = Array.isArray(step.config.offers) ? (step.config.offers as string[]) : [];
  const declineLabel =
    typeof step.config.declineLabel === "string" ? step.config.declineLabel : t("decline");

  return (
    <div className="space-y-4">
      {recap ? (
        <SessionFindingsRecap findings={sessionFindings} />
      ) : (
        <p className="text-lg leading-relaxed text-ink">{body}</p>
      )}
      {offers.slice(0, 2).map((offer) => (
        <Button key={offer} type="button" className="w-full" onClick={onSelectOffer}>
          {offer}
        </Button>
      ))}
      <Button type="button" variant="secondary" className="w-full" onClick={onDecline}>
        {declineLabel}
      </Button>
    </div>
  );
}
