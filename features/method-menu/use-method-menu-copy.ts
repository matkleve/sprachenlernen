"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { Dimension, EvidenceGrade, Section } from "@/lib/method-catalogue";
import { CONTEXT_DIMENSIONS } from "@/lib/method-catalogue";
import { isEndless, type TimeBudget } from "@/lib/time-scale";

/** Human label for a time-budget step — uses methodMenu.timeBudget keys. */
export function formatTimeBudgetWithT(
  t: ReturnType<typeof useTranslations<"methodMenu">>,
  budget: TimeBudget,
): string {
  if (isEndless(budget)) return t("timeBudget.endless");
  if (budget === 60) return t("timeBudget.hour1");
  if (budget === 90) return t("timeBudget.hour1half");
  if (budget === 120) return t("timeBudget.hour2");
  if (budget === 180) return t("timeBudget.hour3");
  if (budget === 240) return t("timeBudget.hour4");
  if (budget === 360) return t("timeBudget.hour6");
  if (budget === 480) return t("timeBudget.hour8");
  if (budget === 720) return t("timeBudget.hour12");
  if (budget === 1440) return t("timeBudget.day1");
  if (budget >= 60) return t("timeBudget.hours", { count: budget / 60 });
  return t("timeBudget.minutes", { count: budget });
}

export function useMethodMenuCopy() {
  const t = useTranslations("methodMenu");

  return useMemo(() => {
    const sections = Object.fromEntries(
      (
        [
          "reading",
          "listening",
          "speaking",
          "writing",
          "form",
          "vocabulary",
          "world",
          "commitments",
        ] as const
      ).map((section) => [section, t(`sections.${section}`)]),
    ) as Record<Section, string>;

    const evidence = Object.fromEntries(
      (["A", "B", "C", "D"] as const).map((grade) => [grade, t(`evidence.${grade}`)]),
    ) as Record<EvidenceGrade, string>;

    const evidenceCard = Object.fromEntries(
      (["A", "B", "C", "D"] as const).map((grade) => [grade, t(`evidenceCard.${grade}`)]),
    ) as Record<EvidenceGrade, string>;

    const evidenceProse = Object.fromEntries(
      (["A", "B", "C", "D"] as const).map((grade) => [grade, t(`evidenceProse.${grade}`)]),
    ) as Record<EvidenceGrade, string>;

    const effortCard = Object.fromEntries(
      ([1, 2, 3] as const).map((level) => [level, t(`effortCard.${level}`)]),
    ) as Record<1 | 2 | 3, string>;

    const intensity = Object.fromEntries(
      ([1, 2, 3] as const).map((level) => [level, t(`intensity.${level}`)]),
    ) as Record<1 | 2 | 3, string>;

    type DimensionLabels = {
      [K in Dimension]: Record<(typeof CONTEXT_DIMENSIONS)[K][number], string>;
    };

    const dimensionValues = Object.fromEntries(
      (Object.keys(CONTEXT_DIMENSIONS) as Dimension[]).map((dimension) => [
        dimension,
        Object.fromEntries(
          CONTEXT_DIMENSIONS[dimension].map((value) => [
            value,
            t(`dimensionValues.${dimension}.${value}`),
          ]),
        ),
      ]),
    ) as DimensionLabels;

    const refineOptions = {
      hands: t.raw("refineOptions.hands") as { value: string; label: string }[],
      voice: t.raw("refineOptions.voice") as { value: string; label: string }[],
      eyes: t.raw("refineOptions.eyes") as { value: string; label: string }[],
    };

    const skillLabels = {
      reading: t("skillLabels.reading"),
      listening: t("skillLabels.listening"),
      speaking: t("skillLabels.speaking"),
      writing: t("skillLabels.writing"),
    } as const;

    const dimensionOrder = Object.keys(CONTEXT_DIMENSIONS) as Dimension[];

    const contributionLabels = {
      primary: t("contributionLabels.primary"),
      secondary: t("contributionLabels.secondary"),
      slight: t("contributionLabels.slight"),
    } as const;

    return {
      t,
      sections,
      evidence,
      evidenceCard,
      evidenceProse,
      effortCard,
      intensity,
      dimensionValues,
      refineOptions,
      skillLabels,
      contributionLabels,
      dimensionOrder,
      formatTimeBudget: (budget: TimeBudget) => formatTimeBudgetWithT(t, budget),
    };
  }, [t]);
}
