import { ShellPageContent } from "./ShellPageContent";

/**
 * Signed-in route loading skeleton. Contract:
 * docs/specs/feature/page-layout.transitions.md
 *
 * Reuses ShellPageContent so width and rhythm match destination pages while
 * Suspense streams the real page — avoids max-w / pt-page-top drift.
 */
export function ShellPageLoading() {
  return (
    <ShellPageContent width="wide">
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        <div aria-hidden className="space-y-4">
          <div className="h-8 w-2/3 rounded-card bg-accent-soft" />
          <div className="h-4 w-full rounded-card bg-accent-soft" />
          <div className="h-4 w-5/6 rounded-card bg-accent-soft" />
        </div>
      </div>
    </ShellPageContent>
  );
}
