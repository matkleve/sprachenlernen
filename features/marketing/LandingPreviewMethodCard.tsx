"use client";

import { Chip } from "@/components/ui/Chip";
import { PressableCard } from "@/components/ui/PressableCard";
import type { MethodEntry } from "@/lib/method-catalogue";

import { MethodBadgeRow } from "@/features/method-menu/MethodBadge";
import { MethodCardHeader } from "@/features/method-menu/MethodCardHeader";
import { methodSectionSurface } from "@/features/method-menu/section-surface";
import { useLocalizedMethod } from "@/features/method-menu/use-localized-method";
import { useMethodMenuCopy } from "@/features/method-menu/use-method-menu-copy";
import { useRequirementHelpers } from "@/features/method-menu/use-requirement-helpers";

export type LandingPreviewMethodCardProps = {
  method: MethodEntry;
  onSelect: () => void;
};

/**
 * Tappable method card for the landing preview — opens explain dialog, no navigation.
 * Contract: docs/specs/page/landing.md
 */
export function LandingPreviewMethodCard({ method, onSelect }: LandingPreviewMethodCardProps) {
  const { t } = useMethodMenuCopy();
  const localized = useLocalizedMethod(method);
  const { requirementChips, durationChips } = useRequirementHelpers();
  const requirements = requirementChips(method.requires);

  return (
    <PressableCard
      type="button"
      onClick={onSelect}
      className={methodSectionSurface(method.section, "flex h-full flex-col text-left shadow-soft")}
    >
      <MethodCardHeader section={method.section} />

      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-3xl font-semibold leading-tight text-ink">{localized.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted">{localized.summary}</p>

        <MethodBadgeRow className="mt-2" method={method} />

        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t("card.properties")}>
          {durationChips(method.durations).map((label) => (
            <li key={`duration-${label}`}>
              <Chip size="card">{label}</Chip>
            </li>
          ))}
          {requirements.map((label) => (
            <li key={`need-${label}`}>
              <Chip size="card">{label}</Chip>
            </li>
          ))}
        </ul>
      </div>
    </PressableCard>
  );
}
