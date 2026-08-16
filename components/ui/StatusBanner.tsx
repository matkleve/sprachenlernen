import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Inline success or info acknowledgement. Contract:
 * docs/specs/component/status-banner.md
 */
const statusBannerVariants = cva("rounded-card border px-4 py-3", {
  variants: {
    variant: {
      success: "border-success bg-success-soft text-ink",
      info: "border-line bg-accent-soft text-ink",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

export type StatusBannerProps = VariantProps<typeof statusBannerVariants> & {
  title: ReactNode;
  body?: ReactNode;
  className?: string;
};

export function StatusBanner({ title, body, variant, className }: StatusBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(statusBannerVariants({ variant }), className)}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {body ? <p className="mt-1 text-sm text-muted">{body}</p> : null}
    </div>
  );
}
