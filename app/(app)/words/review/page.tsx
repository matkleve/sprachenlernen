import Link from "next/link";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import { copy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";

export default async function WordsReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const { method: methodId } = await searchParams;
  const { catalogue } = loadMethodCatalogue();
  const method = methodId ? findMethod(catalogue, methodId) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <Link href={routes.methods} className="text-sm font-medium text-muted hover:text-ink">
        ← {copy.backToMethods}
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>

      {!method ? (
        <p className="mt-4 text-base text-muted">{copy.unknownMethod}</p>
      ) : method.id === "srs-session" ? (
        <ReviewSession methodName={method.name} />
      ) : (
        <p className="mt-4 text-base text-muted">{copy.notBuilt}</p>
      )}
    </div>
  );
}
