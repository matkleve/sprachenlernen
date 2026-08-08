import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A semantic data table. Contract: docs/specs/component/table.md
 *
 * Three exports rather than one, because the two things that make a table
 * usable with a screen reader — a caption and `scope` on every header — are
 * exactly the two things a plain <table> lets you forget. Here `Th` cannot be
 * written without a scope, and `caption` is a required prop.
 */

export type TableProps = {
  /** Required. What this table lists — the only orientation a non-visual user gets. */
  caption: ReactNode;
  /** Set false when the caption is redundant next to a visible heading. */
  showCaption?: boolean;
  children: ReactNode;
  className?: string;
};

export function Table({ caption, showCaption = true, children, className }: TableProps) {
  return (
    // Wide content scrolls inside its own container. Without this the page
    // itself scrolls sideways on a phone, which breaks every other layout on it.
    // tabIndex makes the scroll region reachable by keyboard — a scrollable box
    // that only a mouse can pan is a WCAG failure, not a nicety.
    <div
      /*
       * FIGHTING: jsx-a11y allows tabIndex only on interactive elements, and
       * `region` is a landmark. But WCAG 2.1.1 requires that a scrollable
       * container be operable by keyboard, and focusing it is how the browser
       * gives you arrow-key panning. The rule and the standard disagree here;
       * the standard wins. Removing this would make wide tables mouse-only.
       * REMOVE only if the container stops being scrollable.
       */
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="region"
      aria-label={typeof caption === "string" ? caption : undefined}
      className={cn(
        "overflow-x-auto rounded-card border border-line",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <caption className={cn("px-4 py-3 text-left text-sm text-muted", !showCaption && "sr-only")}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export type ThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  /** Required: `col` for a column header, `row` for a row header. */
  scope: "col" | "row";
};

export function Th({ scope, className, ...props }: ThProps) {
  return (
    <th
      scope={scope}
      className={cn(
        "border-b border-line px-4 py-2.5 text-left font-medium text-ink",
        scope === "row" && "font-normal",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("border-b border-line px-4 py-2.5 text-muted", className)} {...props} />
  );
}
