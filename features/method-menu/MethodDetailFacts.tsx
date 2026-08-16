"use client";

import { useMethodMenuCopy } from "./use-method-menu-copy";
import { Chip } from "@/components/ui/Chip";
import { Disclosure, DisclosureSummary } from "@/components/ui/Disclosure";
import type { MethodEntry } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { useRequirementHelpers } from "./use-requirement-helpers";

export type MethodDetailFactsProps = {
  method: MethodEntry;
  variant: "mobile" | "desktop";
  className?: string;
};

const panelClass =
  "rounded-card border border-line bg-surface-raised p-4 shadow-soft md:sticky md:top-28";

function PracticalDetails({ method }: { method: MethodEntry }) {
  const { t, evidenceCard, evidenceProse } = useMethodMenuCopy();
  const { requirementChips, formatDurationLabel } = useRequirementHelpers();
  const requirements = requirementChips(method.requires);
  const durationLabel = formatDurationLabel(method.durations);

  return (
    <dl className="space-y-4 text-sm">
      <div>
        <dt className="font-medium text-ink">{t("card.duration")}</dt>
        <dd className="mt-1.5">
          <Chip>{durationLabel}</Chip>
        </dd>
      </div>
      {requirements.length > 0 ? (
        <div>
          <dt className="font-medium text-ink">{t("card.needs")}</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {requirements.map((label) => (
              <Chip key={`need-${label}`}>{label}</Chip>
            ))}
          </dd>
        </div>
      ) : null}
      <div>
        <dt className="font-medium text-ink">{t("hosted")}</dt>
        <dd className="mt-1.5">
          <Chip>{method.hosted ? t("hostedShort") : t("notHostedShort")}</Chip>
        </dd>
      </div>
      <div>
        <dt className="font-medium text-ink">{t("detail.researchConfidence")}</dt>
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
  const { t } = useMethodMenuCopy();

  if (variant === "mobile") {
    return (
      <Disclosure className={cn(panelClass, className)}>
        <DisclosureSummary className="font-medium text-ink">
          {t("detail.practicalDetails")}
        </DisclosureSummary>
        <div className="mt-4 border-t border-line pt-4">
          <PracticalDetails method={method} />
        </div>
      </Disclosure>
    );
  }

  return (
    <aside
      aria-label={t("detail.practicalDetails")}
      className={cn(panelClass, className)}
    >
      <p className="text-sm font-semibold text-ink">{t("detail.practicalDetails")}</p>
      <div className="mt-4 border-t border-line pt-4">
        <PracticalDetails method={method} />
      </div>
    </aside>
  );
}
