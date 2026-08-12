import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import {
  focusRing,
  interactiveEmphasis,
  interactionMotion,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

/**
 * Native `<details>` disclosure with a styled summary. Contract:
 * docs/specs/system/interaction-inventory.md
 *
 * Native on purpose — same rationale as Select: the platform owns expand/collapse
 * keyboard behaviour. We only style the summary trigger.
 */
export const disclosureSummaryClass = cn(
  touchTarget,
  "cursor-pointer list-none text-sm text-ink",
  "rounded-pill px-1 -mx-1",
  "marker:content-none [&::-webkit-details-marker]:hidden",
  interactionMotion,
  "hover:bg-accent-soft hover:text-ink",
  focusRing,
  pressScale,
);

export type DisclosureProps = DetailsHTMLAttributes<HTMLDetailsElement>;

export function Disclosure({ className, children, ...props }: DisclosureProps) {
  return (
    <details
      className={cn("rounded-card border border-line bg-surface p-4", className)}
      {...props}
    >
      {children}
    </details>
  );
}

export type DisclosureSummaryProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function DisclosureSummary({ className, children, ...props }: DisclosureSummaryProps) {
  return (
    <summary className={cn(disclosureSummaryClass, className)} {...props}>
      {children}
    </summary>
  );
}
