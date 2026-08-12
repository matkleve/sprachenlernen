import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { cardEngineSessionHref } from "@/lib/method-session";
import { routes } from "@/lib/routes";

import { copy } from "./content";
import type { StandingSummary } from "./standing";

/**
 * One honest sentence above the method filters. Contract:
 * docs/specs/page/method-menu.md § Current standing.
 */
export function CurrentStanding({ summary }: { summary: StandingSummary }) {
  if (summary.kind === "empty") {
    return (
      <section className="mt-6 max-w-2xl" aria-label={copy.standingLabel}>
        <p className="text-base leading-relaxed text-muted">{copy.standingEmpty}</p>
        <ActionLink href={cardEngineSessionHref()} variant="secondary" className="mt-4">
          {copy.standingStartReview}
        </ActionLink>
      </section>
    );
  }

  return (
    <section className="mt-page-content max-w-2xl" aria-label={copy.standingLabel}>
      <p className="text-base leading-relaxed text-ink">{copy.standingRecorded(summary.held, summary.poolSize)}</p>
      <TextLink href={routes.progress} tone="ink" size="sm" className="mt-2 inline-block">
        {copy.standingSeeProgress}
      </TextLink>
    </section>
  );
}
