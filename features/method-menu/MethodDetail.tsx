import { ActionLink } from "@/components/ui/ActionLink";
import { Chip } from "@/components/ui/Chip";
import { disclosureSummaryClass } from "@/components/ui/Disclosure";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { byId, type MethodEntry } from "@/lib/method-catalogue";
import type { SearchParams } from "@/lib/method-menu-filter";
import { menuQueryString } from "@/lib/method-menu-filter";
import { skillMarksForMethod } from "@/lib/method-skill-badges";
import { sessionHrefForMethod, usesWordsReview } from "@/lib/method-session";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import {
  contributionLabels,
  copy,
  effortCard,
  evidenceCard,
  evidenceProse,
  intensity,
  sections,
  skillLabels,
} from "./content";
import { durationChips, requirementChips } from "./requirements";

export type MethodDetailProps = {
  method?: MethodEntry;
  searchParams?: SearchParams;
};

const backLinkClass =
  "hidden h-auto px-0 text-sm font-medium text-muted hover:bg-transparent hover:text-ink md:inline-flex";

export function MethodDetail({ method, searchParams = {} }: MethodDetailProps) {
  const backHref = `${routes.methods}${menuQueryString(searchParams)}`;

  if (!method) {
    return (
      <ShellPageContent mode="scrollable-drill-in" width="narrow">
        <p className="text-base text-muted">{copy.methodNotFound}</p>
        <ActionLink
          href={backHref}
          variant="ghost"
          size="sm"
          className={cn(backLinkClass, "mt-4")}
        >
          {copy.backToMethods}
        </ActionLink>
      </ShellPageContent>
    );
  }

  const requirements = requirementChips(method.requires);
  const skillMarks = skillMarksForMethod(method);
  const skillLine =
    skillMarks.length > 0
      ? skillMarks
          .map(
            (mark) =>
              `${skillLabels[mark.skill]} (${contributionLabels[mark.level]})`,
          )
          .join(" · ")
      : null;

  return (
    <ShellPageContent mode="scrollable-drill-in" width="narrow">
      <ActionLink href={backHref} variant="ghost" size="sm" className={backLinkClass}>
        ← {copy.backToMethods}
      </ActionLink>

      <p className="mt-6 text-sm font-medium uppercase tracking-widest text-muted">
        {sections[method.section]}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{method.name}</h1>
      <p className="mt-2 text-base leading-relaxed text-muted">{method.summary}</p>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-ink">{copy.detail.practical}</h2>
        <p className="mt-2 text-base text-muted">
          {effortCard[method.intensity]} — {intensity[method.intensity]}
        </p>
        <dl className="mt-4 grid gap-3 text-sm">
          <div>
            <dt className="font-medium text-ink">{copy.card.duration}</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {durationChips(method.durations).map((label) => (
                <Chip key={`duration-${label}`}>{label}</Chip>
              ))}
            </dd>
          </div>
          {requirements.length > 0 ? (
            <div>
              <dt className="font-medium text-ink">{copy.card.needs}</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {requirements.map((label) => (
                  <Chip key={`need-${label}`}>{label}</Chip>
                ))}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-ink">{copy.hosted}</dt>
            <dd className="mt-1">
              <Chip>{method.hosted ? copy.hostedShort : copy.notHostedShort}</Chip>
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-ink">{copy.card.trains}</h2>
        <p className="mt-2 text-base leading-relaxed text-muted">{method.trains}</p>
        {skillLine ? (
          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-ink">{copy.detail.mainly}: </span>
            {skillLine}
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-card border border-line bg-surface-raised p-4 shadow-soft">
        <h2 className="text-base font-semibold text-ink">{copy.card.doesNotDo}</h2>
        <p className="mt-2 text-base leading-relaxed text-muted">{method.doesNotDo}</p>
      </section>

      <details className="mt-8">
        <summary className={disclosureSummaryClass}>{copy.detail.researchConfidence}</summary>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {evidenceCard[method.evidence]} — {evidenceProse[method.evidence]}
        </p>
      </details>

      <p className="mt-6 text-sm text-muted">
        {method.hosted ? copy.hosted : copy.notHosted}
      </p>

      {usesWordsReview(method) && (
        <ActionLink href={sessionHrefForMethod(method)} variant="primary" size="lg" className="mt-8">
          {copy.startSession}
        </ActionLink>
      )}

      {method.hosted && !usesWordsReview(method) && (
        <p className="mt-8 text-sm text-muted">{copy.sessionNotBuilt}</p>
      )}
    </ShellPageContent>
  );
}

export function findMethod(
  catalogue: { entries: { id: string }[] } | undefined,
  id: string,
): MethodEntry | undefined {
  if (!catalogue) return undefined;
  const entry = byId(catalogue as Parameters<typeof byId>[0], id);
  return entry?.type === "method" ? entry : undefined;
}
