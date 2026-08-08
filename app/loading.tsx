/**
 * Route-level loading UI, shown while a server component streams.
 *
 * A skeleton, not a spinner: it holds the shape the content will take, so the
 * page does not jump when it arrives. `docs/CONSTITUTION.md` §3 — the live
 * region means a screen reader is told something is happening rather than
 * silently waiting.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-4xl px-6 pt-page-top pb-page-bottom"
    >
      <span className="sr-only">Loading</span>
      <div aria-hidden className="space-y-4">
        <div className="h-8 w-2/3 rounded-card bg-accent-soft" />
        <div className="h-4 w-full rounded-card bg-accent-soft" />
        <div className="h-4 w-5/6 rounded-card bg-accent-soft" />
      </div>
    </div>
  );
}
