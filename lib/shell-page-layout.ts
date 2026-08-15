/**
 * Layout mode registry for signed-in routes. Contract:
 * docs/specs/feature/page-layout.md
 */
export type ShellPageLayoutMode =
  | "scrollable-destination"
  | "scrollable-drill-in"
  | "one-screen-runner";

/** True when pathname is an active review session (one-screen runner on mobile). */
export function isActiveReviewSession(pathname: string, searchParams: URLSearchParams): boolean {
  return pathname === "/words/review" && searchParams.get("method") === "srs-session";
}

/**
 * Returns the layout mode for a signed-in pathname. Query params matter only for
 * `/words/review` (active session vs error/empty states).
 */
export function shellPageLayout(
  pathname: string,
  searchParams: URLSearchParams = new URLSearchParams(),
): ShellPageLayoutMode {
  if (isActiveReviewSession(pathname, searchParams)) {
    return "one-screen-runner";
  }

  if (pathname.startsWith("/methods/") && pathname !== "/methods") {
    return "scrollable-drill-in";
  }

  if (pathname === "/words/review") {
    return "scrollable-drill-in";
  }

  return "scrollable-destination";
}
