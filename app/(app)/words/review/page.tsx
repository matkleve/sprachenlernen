import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { buildSessionAction } from "@/features/review-session/actions";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import { routes } from "@/lib/routes";
import { shellPageLayout } from "@/lib/shell-page-layout";

/**
 * Thin route at `/words/review`. Contract: docs/specs/page/words-review.md
 */
export default async function WordsReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const t = await getTranslations("reviewSession");
  const { method: methodId } = await searchParams;
  const layoutParams = new URLSearchParams(methodId ? { method: methodId } : {});
  const layoutMode = shellPageLayout("/words/review", layoutParams);

  let session: ReactNode;
  if (!methodId) {
    session = <p className="mt-4 text-base text-muted">{t("unknownMethod")}</p>;
  } else if (layoutMode === "one-screen-runner") {
    const outcome = await buildSessionAction();
    if (outcome.status === "no-language") {
      redirect(routes.chooseLanguage);
    }

    session = (
      <ReviewSession
        methodName={t("srsSessionName")}
        compact
        initialData={
          outcome.status === "error"
            ? { status: "error", error: outcome.error }
            : { status: "ok", queue: outcome.queue, languageName: outcome.languageName }
        }
      />
    );
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
