"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { navLinkVariants } from "@/components/ui/NavLink";
import { cn } from "@/lib/utils";

/**
 * In-place filter toggle — same look as NavLink, but a button because it does
 * not navigate (method menu filters client-side). Contract:
 * docs/specs/page/method-menu.md
 */
export type FilterPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  current?: boolean;
  children: ReactNode;
  /** Decorative leading icon — label remains the accessible name. */
  icon?: ReactNode;
};

export function FilterPill({
  current = false,
  className,
  children,
  icon,
  ...props
}: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={current}
      className={cn(navLinkVariants({ current }), icon && "gap-2", className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
