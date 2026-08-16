import { cn } from "@/lib/utils";

type DisclosureChevronProps = {
  className?: string;
};

/**
 * Filled triangle for native `<details>` summaries. Contract:
 * docs/specs/system/interaction-inventory.md — pairs with `DisclosureSummary`
 * and rotates when the parent `group` details is open.
 */
export function DisclosureChevron({ className }: DisclosureChevronProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 8 6"
      className={cn(
        "size-2 shrink-0 text-ink transition-transform duration-150 ease-out-soft group-open:rotate-180",
        className,
      )}
    >
      <path d="M4 6 0 0h8z" fill="currentColor" />
    </svg>
  );
}
