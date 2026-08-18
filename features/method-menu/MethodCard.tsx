"use client";

import { useMethodMenuCopy } from "./use-method-menu-copy";
import { useLocalizedMethod } from "./use-localized-method";
import { Chip } from "@/components/ui/Chip";
import { SurfaceLink } from "@/components/ui/SurfaceLink";
import type { MethodEntry } from "@/lib/method-catalogue";
import { cardHrefForMethod } from "@/lib/method-session";

import { MethodBadgeRow } from "./MethodBadge";
import { MethodCardHeader } from "./MethodCardHeader";
import { useRequirementHelpers } from "./use-requirement-helpers";
import { methodSectionSurface } from "./section-surface";

export type MethodCardProps = {
  method: MethodEntry;
  /** Active filter query string, e.g. `?context=kitchen` — preserved on navigation. */
  returnQuery?: string;
};

/**
 * One Method, compact and tappable. Contract: docs/specs/page/method-menu.md
 */
export function MethodCard({ method, returnQuery = "" }: MethodCardProps) {
  const { t } = useMethodMenuCopy();
  const localized = useLocalizedMethod(method);
  const { requirementChips, durationChips } = useRequirementHelpers();
  const href = cardHrefForMethod(method, returnQuery);
  const requirements = requirementChips(method.requires);

  return (
    <SurfaceLink
      href={href}
      className={methodSectionSurface(
        method.section,
        "flex h-full flex-col shadow-soft focus-visible:ring-offset-2",
      )}
    >
      <MethodCardHeader section={method.section} />

      <div className="flex flex-1 flex-col p-3">
        <div>
          <h3 className="text-xl font-semibold text-ink">{localized.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">{localized.summary}</p>
        </div>

        <MethodBadgeRow className="mt-2 shrink-0" method={method} inLink />

        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t('card.properties')}>
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
          <li>
            <Chip size="card">{method.hosted ? t('hostedShort') : t('notHostedShort')}</Chip>
          </li>
        </ul>

        <p className="mt-2 line-clamp-2 text-sm text-muted">
          <span className="font-medium text-ink">{t('card.doesNotDo')}: </span>
          {localized.doesNotDo}
        </p>
      </div>
    </SurfaceLink>
  );
}
