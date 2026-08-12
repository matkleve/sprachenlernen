import type { ReactNode } from "react";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import { copy } from "@/features/review-session/content";
import { CARD_ENGINE_METHOD_ID } from "@/lib/method-session";
import { cn } from "@/lib/utils";

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
  const isActiveSession = methodId === CARD_ENGINE_METHOD_ID;

  let session: ReactNode;
  if (!methodId) {
    session = <p className="mt-4 text-base text-muted">{copy.unknownMethod}</p>;
  } else if (isActiveSession) {
    session = <ReviewSession methodName={copy.srsSessionName} compact />;
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
    <div
      className={cn(
        "mx-auto max-w-2xl px-4 md:px-6 md:pt-page-top md:pb-page-bottom",
        isActiveSession &&
          "flex h-review-session flex-col overflow-hidden md:h-auto md:overflow-visible",
      )}
    >
      {session}
    </div>
  );
}
