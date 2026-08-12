/**
 * Shown inside the signed-in shell while a page's server component loads.
 * The shell header stays visible — only the main region is pending.
 */
export default function AppLoading() {
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
