import { Chip } from "@/components/ui/Chip";
import { SurfaceLink } from "@/components/ui/SurfaceLink";
import type { MethodEntry } from "@/lib/method-catalogue";
import { cardHrefForMethod } from "@/lib/method-session";

import { copy, evidenceShort, intensity } from "./content";
import { durationChips, requirementChips } from "./requirements";

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

  return (
    <article className="h-full rounded-card border border-line bg-surface shadow-soft">
      <SurfaceLink href={href} className="p-4 focus-visible:ring-offset-2">
        <h3 className="text-base font-semibold text-ink">{method.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{method.summary}</p>

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
            <Chip tone="accent">{intensity[method.intensity]}</Chip>
          </li>
          <li>
            <Chip tone="accent">{evidenceShort[method.evidence]}</Chip>
          </li>
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
