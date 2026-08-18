/**
 * Layout mode registry for signed-in routes. Contract:
 * docs/specs/feature/page-layout.md
 */
import { hasExerciseRecipe } from "@/lib/exercise-recipe-built";
import { CARD_ENGINE_METHOD_ID } from "@/lib/method-session";
import { routes } from "@/lib/routes";

export type ShellPageLayoutMode =
  | "scrollable-destination"
  | "scrollable-drill-in"
  | "one-screen-runner";

/** True when pathname is an active review session (one-screen runner on mobile). */
export function isActiveReviewSession(pathname: string, searchParams: URLSearchParams): boolean {
  return pathname === routes.wordsReview && searchParams.get("method") === CARD_ENGINE_METHOD_ID;
}

/** True when pathname is an active exercise session with a built recipe. */
export function isActiveExerciseSession(pathname: string, searchParams: URLSearchParams): boolean {
  if (pathname !== routes.practice) return false;
  const methodId = searchParams.get("method");
  return methodId !== null && hasExerciseRecipe(methodId);
}

/**
 * Returns the layout mode for a signed-in pathname. Query params matter for
 * runner routes (`/words/review`, `/practice`).
 */
export function shellPageLayout(
  pathname: string,
  searchParams: URLSearchParams = new URLSearchParams(),
): ShellPageLayoutMode {
  if (isActiveReviewSession(pathname, searchParams)) {
    return "one-screen-runner";
  }

  if (isActiveExerciseSession(pathname, searchParams)) {
    return "one-screen-runner";
  }

  if (pathname.startsWith("/methods/") && pathname !== "/methods") {
    return "scrollable-drill-in";
  }

  if (pathname === routes.wordsReview || pathname === routes.practice) {
    return "scrollable-drill-in";
  }

  if (pathname.startsWith("/content/") && pathname !== routes.content) {
    return "scrollable-drill-in";
  }

  return "scrollable-destination";
}
