import Link from "next/link";
import type { ReactNode } from "react";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import { copy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";

/**
 * Thin route at `/words/review`. Contract: docs/specs/page/words-review.md
 *
 * `srs-session` is a fast path: it does not read `data/methods/` from disk.
 * Vercel's file tracer only ships that directory for routes listed in
 * `outputFileTracingIncludes` — without the fast path, production would not
 * find the method even though the session is built (see docs/TRAPS.md).
 */
export default async function WordsReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const { method: methodId } = await searchParams;

  let session: ReactNode;
  if (!methodId) {
    session = <p className="mt-4 text-base text-muted">{copy.unknownMethod}</p>;
  } else if (methodId === "srs-session") {
    session = <ReviewSession methodName={copy.srsSessionName} />;
  } else {
    const { catalogue } = loadMethodCatalogue();
    const method = findMethod(catalogue, methodId);
    if (!method) {
      session = <p className="mt-4 text-base text-muted">{copy.unknownMethod}</p>;
    } else {
      session = <p className="mt-4 text-base text-muted">{copy.notBuilt}</p>;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <Link href={routes.methods} className="text-sm font-medium text-muted hover:text-ink">
        ← {copy.backToMethods}
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>

      {session}
    </div>
  );
}
