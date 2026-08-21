import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { buildSessionAction } from "@/features/review-session/actions";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import { routes } from "@/lib/routes";
import { parseReviewDeck, type ReviewDeck } from "@/lib/review-deck";
import { shellPageLayout } from "@/lib/shell-page-layout";

/**
 * Thin route at `/words/review`. Contract: docs/specs/page/words-review.md
 */
export default async function WordsReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string; deck?: string; minutes?: string }>;
}) {
  const t = await getTranslations("reviewSession");
  const { method: methodId, deck: deckParam } = await searchParams;
  const deck: ReviewDeck = parseReviewDeck(deckParam);
  const layoutParams = new URLSearchParams(methodId ? { method: methodId } : {});
  if (deck !== "mixed") layoutParams.set("deck", deck);
  const layoutMode = shellPageLayout("/words/review", layoutParams);

  let session: ReactNode;
  if (!methodId) {
    session = <p className="mt-4 text-base text-muted">{t("unknownMethod")}</p>;
  } else if (layoutMode === "one-screen-runner") {
    const { catalogue } = loadMethodCatalogue();
    const method = findMethod(catalogue, methodId);
    if (!method) {
      session = <p className="mt-4 text-base text-muted">{t("unknownMethod")}</p>;
    } else {
      const outcome = await buildSessionAction({ deck });
      if (outcome.status === "no-language") {
        redirect(routes.chooseLanguage);
      }

      session = (
        <ReviewSession
          methodName={t("srsSessionName")}
          compact
          deck={deck}
          initialData={
            outcome.status === "error"
              ? { status: "error", error: outcome.error }
              : { status: "ok", queue: outcome.queue, languageName: outcome.languageName }
          }
        />
      );
    }
  } else {
    const { catalogue } = loadMethodCatalogue();
    const method = findMethod(catalogue, methodId);
    if (!method) {
      session = <p className="mt-4 text-base text-muted">{t("unknownMethod")}</p>;
    } else {
      session = <p className="mt-4 text-base text-muted">{t("notBuilt")}</p>;
    }
  }

  return (
    <ShellPageContent mode={layoutMode} width="narrow">
      {session}
    </ShellPageContent>
  );
}
