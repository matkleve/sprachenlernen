/**
 * Section label — matches Methods catalogue section headings.
 * Contract: docs/specs/feature/words-home.md
 */
export function WordsSectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">{children}</h2>
  );
}
