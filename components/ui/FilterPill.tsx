"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { navLinkVariants } from "@/components/ui/NavLink";
import { cn } from "@/lib/utils";

/**
 * In-place filter toggle — same look as NavLink, but a button because it does
 * not navigate (method menu filters client-side). **FilterIconPill** is the
 * icon-only variant. Contract: docs/specs/page/method-menu.md
 */
export type FilterPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  current?: boolean;
  children: ReactNode;
};

export function FilterPill({ current = false, className, children, ...props }: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={current}
      className={cn(navLinkVariants({ current }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export type FilterIconPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  current?: boolean;
  /** Accessible name — visible label is omitted (icon-only). */
  label: string;
  children: ReactNode;
};

/** Icon-only filter toggle — square pill, equal padding on all sides. */
export function FilterIconPill({
  current = false,
  className,
  label,
  children,
  ...props
}: FilterIconPillProps) {
  return (
    <button
      type="button"
      aria-pressed={current}
      aria-label={label}
      className={cn(
        navLinkVariants({ current }),
        "aspect-square w-11 shrink-0 px-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
