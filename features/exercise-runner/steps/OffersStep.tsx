"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

function readOfferLabels(
  config: Record<string, unknown>,
  t: (key: string) => string,
): string[] {
  if (Array.isArray(config.offerKeys)) {
    return config.offerKeys.flatMap((key) =>
      typeof key === "string" ? [t(key)] : [],
    );
  }
  if (Array.isArray(config.offers)) {
    return config.offers.filter((offer): offer is string => typeof offer === "string");
  }
  return [];
}

export function OffersStep({
  step,
  onDecline,
  onSelectOffer,
}: Pick<StepRenderProps, "step" | "onDecline" | "onSelectOffer">) {
  const t = useTranslations("exerciseRunner");
  const offers = readOfferLabels(step.config, t);

  return (
    <div className="space-y-3 px-0.5">
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
