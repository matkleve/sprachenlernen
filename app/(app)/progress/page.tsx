import type { Metadata } from "next";

import { holding } from "@/features/app-shell/content";

export const metadata: Metadata = {
  title: holding.progress.title,
};

/**
 * A holding page — see app/(app)/words/page.tsx for why these exist at all.
 * What lives here is T-B3, and ADR-0009 already named the hardest part of it:
 * this is where "nothing measured yet" has to be rendered with dignity.
 */
export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{holding.progress.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{holding.progress.intent}</p>
      <p className="mt-page-content text-base leading-relaxed text-muted">
        {holding.progress.notYet}
      </p>
    </div>
  );
}
