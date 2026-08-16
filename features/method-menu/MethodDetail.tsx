import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { byId, type MethodEntry } from "@/lib/method-catalogue";
import type { SearchParams } from "@/lib/method-menu-filter";
import { menuQueryString } from "@/lib/method-menu-filter";
import { sessionHrefForMethod, usesWordsReview } from "@/lib/method-session";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { MethodDetailBadgeBand } from "./MethodDetailBadgeBand";
import { MethodDetailFacts } from "./MethodDetailFacts";
import { MethodDetailHero } from "./MethodDetailHero";
import { copy } from "./content";

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

  return (
    <>
      <MethodDetailHero section={method.section} />

      <ShellPageContent mode="scrollable-drill-in" width="wide">
        <ActionLink href={backHref} variant="ghost" size="sm" className={cn(backLinkClass, "mb-4")}>
          ← {copy.backToMethods}
        </ActionLink>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
          <article className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {method.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{method.summary}</p>

            <MethodDetailBadgeBand method={method} className="mt-6" />

            <MethodDetailFacts method={method} variant="mobile" className="md:hidden" />

            <p className="mt-8 text-lg leading-relaxed text-ink">{method.trains}</p>

            <div className="mt-8 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
              <p className="text-base leading-relaxed text-muted">
                <span className="font-semibold text-ink">{copy.card.doesNotDo}. </span>
                {method.doesNotDo}
              </p>
            </div>

            <p className="mt-6 text-sm text-muted">
              {method.hosted ? copy.hosted : copy.notHosted}
            </p>

            {usesWordsReview(method) && (
              <ActionLink
                href={sessionHrefForMethod(method)}
                variant="primary"
                size="lg"
                className="mt-8"
              >
                {copy.startSession}
              </ActionLink>
            )}

            {method.hosted && !usesWordsReview(method) && (
              <p className="mt-8 text-sm text-muted">{copy.sessionNotBuilt}</p>
            )}
          </article>

          <div className="hidden md:block">
            <MethodDetailFacts method={method} variant="desktop" />
          </div>
        </div>
      </ShellPageContent>
    </>
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
