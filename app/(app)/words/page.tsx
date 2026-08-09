import type { Metadata } from "next";

import { holding } from "@/features/app-shell/content";

export const metadata: Metadata = {
  title: holding.words.title,
};

/**
 * A holding page. The destination exists because ADR-0009 decided it does, and
 * navigation with a dead third of it is worse than navigation that says what is
 * coming. What lives here is T-B1 and T-B2 — this page invents none of it, and
 * the sentence below is ADR-0009's own description of the destination.
 */
export default function WordsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{holding.words.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{holding.words.intent}</p>
      <p className="mt-page-content text-base leading-relaxed text-muted">
        {holding.words.notYet}
      </p>
    </div>
  );
}
