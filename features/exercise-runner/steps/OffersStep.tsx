"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function OffersStep({
  step,
  onDecline,
  onSelectOffer,
}: Pick<StepRenderProps, "step" | "onDecline" | "onSelectOffer">) {
  const t = useTranslations("exerciseRunner");
  const offers = Array.isArray(step.config.offers) ? (step.config.offers as string[]) : [];

  return (
    <div className="space-y-3">
      {offers.slice(0, 2).map((offer) => (
        <Button key={offer} type="button" className="w-full" onClick={onSelectOffer}>
          {offer}
        </Button>
      ))}
      <Button type="button" variant="secondary" className="w-full" onClick={onDecline}>
        {t("decline")}
      </Button>
    </div>
  );
}
