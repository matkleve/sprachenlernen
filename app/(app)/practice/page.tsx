import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ExerciseRunner } from "@/features/exercise-runner/ExerciseRunner";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import { CARD_ENGINE_METHOD_ID } from "@/lib/method-session";
import { routes } from "@/lib/routes";
import { shellPageLayout } from "@/lib/shell-page-layout";

/**
 * Thin route at `/practice`. Contract: docs/specs/page/practice.md
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string; sourceId?: string }>;
}) {
  const t = await getTranslations("reviewSession");
  const { method: methodId, sourceId } = await searchParams;

  if (methodId === CARD_ENGINE_METHOD_ID) {
    redirect(`${routes.wordsReview}?method=${encodeURIComponent(CARD_ENGINE_METHOD_ID)}`);
  }

  const layoutParams = new URLSearchParams();
  if (methodId) layoutParams.set("method", methodId);
  const layoutMode = shellPageLayout(routes.practice, layoutParams);

  if (!methodId) {
    return (
      <ShellPageContent mode="scrollable-drill-in" width="narrow">
        <p className="mt-4 text-base text-muted">{t("unknownMethod")}</p>
      </ShellPageContent>
    );
  }

  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, methodId);
  const recipe = resolveExerciseRecipe(methodId, sourceId);

  if (!method) {
    return (
      <ShellPageContent mode="scrollable-drill-in" width="narrow">
        <p className="mt-4 text-base text-muted">{t("unknownMethod")}</p>
      </ShellPageContent>
    );
  }

  if (!recipe) {
    return (
      <ShellPageContent mode="scrollable-drill-in" width="narrow">
        <p className="mt-4 text-base text-muted">{t("notBuilt")}</p>
      </ShellPageContent>
    );
  }

  return (
    <ShellPageContent mode={layoutMode} width="narrow">
      <ExerciseRunner methodName={method.name} recipe={recipe} compact={layoutMode === "one-screen-runner"} />
    </ShellPageContent>
  );
}
