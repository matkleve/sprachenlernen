import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { DisclosureChevron } from "@/components/ui/DisclosureChevron";
import {
  disclosureShellPress,
  focusRing,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

/**
 * Native `<details>` disclosure with a styled summary. Contract:
 * docs/specs/component/disclosure.md
 *
 * Native on purpose — same rationale as Select: the platform owns expand/collapse
 * keyboard behaviour. Press feedback applies to the shell; the panel animates open.
 */
export const disclosureShellClass = cn(
  "group rounded-card border border-line bg-surface-raised shadow-soft",
  disclosureShellPress,
);

export const disclosureSummaryClass = cn(
  touchTarget,
  "block w-full cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink",
  "marker:content-none [&::-webkit-details-marker]:hidden",
  focusRing,
);

const disclosurePanelMotion = cn(
  "grid grid-rows-[0fr] transition-[grid-template-rows] duration-150 ease-out-soft",
  "group-open:grid-rows-[1fr]",
);

export type DisclosureProps = DetailsHTMLAttributes<HTMLDetailsElement>;

export function Disclosure({ className, children, ...props }: DisclosureProps) {
  return (
    <details className={cn(disclosureShellClass, className)} {...props}>
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
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0">{children}</span>
        <DisclosureChevron />
      </span>
    </summary>
  );
}

export type DisclosurePanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Animated expand/collapse wrapper — required for body content. */
export function DisclosurePanel({ className, children, ...props }: DisclosurePanelProps) {
  return (
    <div className={disclosurePanelMotion}>
      <div className={cn("overflow-hidden", className)} {...props}>
        {children}
      </div>
    </div>
  );
}
