import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
        <Link
          href={`${routes.wordsReview}?method=srs-session`}
          className={cn(buttonVariants({ variant: "secondary" }), "mt-4")}
        >
          {copy.standingStartReview}
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-page-content max-w-2xl" aria-label={copy.standingLabel}>
      <p className="text-base leading-relaxed text-ink">{copy.standingRecorded(summary.held, summary.poolSize)}</p>
      <Link href={routes.progress} className="mt-2 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
        {copy.standingSeeProgress}
      </Link>
    </section>
  );
}
