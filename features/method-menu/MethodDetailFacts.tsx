import { Chip } from "@/components/ui/Chip";
import { Disclosure, DisclosureSummary } from "@/components/ui/Disclosure";
import type { MethodEntry } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { copy, evidenceCard, evidenceProse } from "./content";
import { formatDurationLabel, requirementChips } from "./requirements";

export type MethodDetailFactsProps = {
  method: MethodEntry;
  variant: "mobile" | "desktop";
  className?: string;
};

const panelClass =
  "rounded-card border border-line bg-surface-raised p-4 shadow-soft md:sticky md:top-28";

function PracticalDetails({ method }: { method: MethodEntry }) {
  const requirements = requirementChips(method.requires);
  const durationLabel = formatDurationLabel(method.durations);

  return (
    <dl className="space-y-4 text-sm">
      <div>
        <dt className="font-medium text-ink">{copy.card.duration}</dt>
        <dd className="mt-1.5">
          <Chip>{durationLabel}</Chip>
        </dd>
      </div>
      {requirements.length > 0 ? (
        <div>
          <dt className="font-medium text-ink">{copy.card.needs}</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {requirements.map((label) => (
              <Chip key={`need-${label}`}>{label}</Chip>
            ))}
          </dd>
        </div>
      ) : null}
      <div>
        <dt className="font-medium text-ink">{copy.hosted}</dt>
        <dd className="mt-1.5">
          <Chip>{method.hosted ? copy.hostedShort : copy.notHostedShort}</Chip>
        </dd>
      </div>
      <div>
        <dt className="font-medium text-ink">{copy.detail.researchConfidence}</dt>
        <dd className="mt-1.5">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-ink underline decoration-line underline-offset-2">
              {evidenceCard[method.evidence]}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {evidenceProse[method.evidence]}
            </p>
          </details>
        </dd>
      </div>
    </dl>
  );
}

/**
 * Duration, needs, hosted, and research — collapsed on mobile, sticky aside on
 * desktop. Render once per variant. Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailFacts({ method, variant, className }: MethodDetailFactsProps) {
  if (variant === "mobile") {
    return (
      <Disclosure className={cn(panelClass, className)}>
        <DisclosureSummary className="font-medium text-ink">
          {copy.detail.practicalDetails}
        </DisclosureSummary>
        <div className="mt-4 border-t border-line pt-4">
          <PracticalDetails method={method} />
        </div>
      </Disclosure>
    );
  }

  return (
    <aside
      aria-label={copy.detail.practicalDetails}
      className={cn(panelClass, className)}
    >
      <p className="text-sm font-semibold text-ink">{copy.detail.practicalDetails}</p>
      <div className="mt-4 border-t border-line pt-4">
        <PracticalDetails method={method} />
      </div>
    </aside>
  );
}
