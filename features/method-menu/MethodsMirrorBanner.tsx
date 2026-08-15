/**
 * Visible only on `/methods-mirror` — Safari toolbar A/B against `/methods`.
 * REMOVE when study/29 mirror experiment closes.
 */
export function MethodsMirrorBanner() {
  return (
    <div className="border-b border-line bg-accent-soft px-4 py-2 text-center text-xs leading-relaxed text-muted">
      Safari debug mirror — same catalogue as Methods. Edit{" "}
      <code className="text-ink">app/(app)/methods-mirror/page.tsx</code> to diff behaviour.
    </div>
  );
}
