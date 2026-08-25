import { cn } from "@/lib/utils";

export type PracticePrepEntry = {
  id: string;
  label: string;
};

type PracticePrepListProps = {
  entries: readonly PracticePrepEntry[];
  className?: string;
};

/**
 * Static prep requirements — not interactive; **Weiter** does not wait on them.
 * Contract: docs/specs/feature/practice-surface.md
 */
export function PracticePrepList({ entries, className }: PracticePrepListProps) {
  if (entries.length === 0) return null;

  return (
    <ul className={cn("space-y-2 max-md:space-y-1.5", className)} aria-label="Requirements">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={cn(
            "border-x border-line-strong bg-surface px-4 py-3",
            "max-md:px-3 max-md:py-2",
            "text-base font-semibold leading-snug text-ink max-md:text-sm",
          )}
        >
          {entry.label}
        </li>
      ))}
    </ul>
  );
}
