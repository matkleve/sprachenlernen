"use client";

import { useTranslations } from "next-intl";

type RoundMarkerStepProps = {
  config: Record<string, unknown>;
};

export function RoundMarkerStep({ config }: RoundMarkerStepProps) {
  const t = useTranslations("exerciseRunner");
  const round = typeof config.round === "number" ? config.round : 1;
  const totalRounds = typeof config.totalRounds === "number" ? config.totalRounds : 3;
  const minutes = typeof config.minutes === "number" ? config.minutes : undefined;

  return (
    <p className="text-lg font-medium text-ink">
      {minutes !== undefined
        ? t("roundMarkerWithTime", { round, total: totalRounds, minutes })
        : t("roundMarker", { round, total: totalRounds })}
    </p>
  );
}
