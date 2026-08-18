import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A compact label for one fact. Contract: docs/specs/component/chip.md
 *
 * Non-interactive by default — filter chips wrap this in a link; card chips
 * leave it as a span.
 */
const chip = cva(
  "inline-flex items-center whitespace-nowrap rounded-pill font-medium",
  {
    variants: {
      tone: {
        default: "border border-line bg-surface text-muted",
        accent: "bg-accent-soft text-ink",
        selected: "bg-accent text-accent-ink",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        card: "min-h-8 px-3 py-1 text-sm",
      },
    },
    defaultVariants: { tone: "default", size: "default" },
  },
);

export type ChipProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof chip>;

export function Chip({ tone, size, className, ...props }: ChipProps) {
  return <span className={cn(chip({ tone, size }), className)} {...props} />;
}
