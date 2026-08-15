import { Chip } from "@/components/ui/Chip";
import { SurfaceLink } from "@/components/ui/SurfaceLink";
import type { MethodEntry } from "@/lib/method-catalogue";
import { skillMarksForMethod } from "@/lib/method-skill-badges";
import { cardHrefForMethod } from "@/lib/method-session";

import { MethodBadgeRow } from "./MethodBadge";
import { copy } from "./content";
import { durationChips, requirementChips } from "./requirements";
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
  const href = cardHrefForMethod(method, returnQuery);
  const requirements = requirementChips(method.requires);
  const skillMarks = skillMarksForMethod(method);

  return (
    <article
      className={methodSectionSurface(method.section, "h-full rounded-card shadow-soft")}
    >
      <SurfaceLink href={href} className="p-4 focus-visible:ring-offset-2">
        <h3 className="text-base font-semibold text-ink">{method.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{method.summary}</p>

        <MethodBadgeRow
          className="mt-3"
          skillMarks={skillMarks}
          evidence={method.evidence}
          intensity={method.intensity}
          inLink
        />

        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={copy.card.properties}>
          {durationChips(method.durations).map((label) => (
            <li key={`duration-${label}`}>
              <Chip>{label}</Chip>
            </li>
          ))}
          {requirements.map((label) => (
            <li key={`need-${label}`}>
              <Chip>{label}</Chip>
            </li>
          ))}
          <li>
            <Chip>{method.hosted ? copy.hostedShort : copy.notHostedShort}</Chip>
          </li>
        </ul>

        <p className="mt-3 line-clamp-2 text-sm text-muted">
          <span className="font-medium text-ink">{copy.card.doesNotDo}: </span>
          {method.doesNotDo}
        </p>
      </SurfaceLink>
    </article>
  );
}
