import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * A semantic data table. Contract: docs/specs/component/table.md
 *
 * Three exports rather than one, because the two things that make a table
 * usable with a screen reader — a caption and `scope` on every header — are
 * exactly the two things a plain <table> lets you forget. Here `Th` cannot be
 * written without a scope, and `caption` is a required prop.
 */

const tableWrapperVariants = cva("rounded-card border border-line", {
  variants: {
    layout: {
      scroll: "overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      fit: "",
    },
  },
  defaultVariants: {
    layout: "scroll",
  },
});

export type TableProps = {
  /** Required. What this table lists — the only orientation a non-visual user gets. */
  caption: ReactNode;
  /** Set false when the caption is redundant next to a visible heading. */
  showCaption?: boolean;
  children: ReactNode;
  className?: string;
} & VariantProps<typeof tableWrapperVariants>;

export function Table({
  caption,
  showCaption = true,
  children,
  className,
  layout = "scroll",
}: TableProps) {
  const isScrollLayout = layout === "scroll";

  return (
    <div
      {...(isScrollLayout
        ? {
            /*
             * FIGHTING: jsx-a11y allows tabIndex only on interactive elements, and
             * `region` is a landmark. But WCAG 2.1.1 requires that a scrollable
             * container be operable by keyboard, and focusing it is how the browser
             * gives you arrow-key panning. The rule and the standard disagree here;
             * the standard wins. Removing this would make wide tables mouse-only.
             * REMOVE only if the container stops being scrollable.
             */
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex: 0,
            role: "region" as const,
            "aria-label": typeof caption === "string" ? caption : undefined,
          }
        : {})}
      className={cn(tableWrapperVariants({ layout }), className)}
    >
      <table
        className={cn(
          "w-full border-collapse text-sm",
          layout === "fit" && "table-fixed",
        )}
      >
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
        "break-words border-b border-line px-4 py-2.5 text-left font-medium text-ink",
        scope === "row" && "font-normal",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("break-words border-b border-line px-4 py-2.5 text-muted", className)} {...props} />
  );
}
