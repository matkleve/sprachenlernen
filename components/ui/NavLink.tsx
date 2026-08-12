"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import {
  disabledState,
  focusRing,
  hitAreaAnchor,
  hitAreaExpandNav,
  hitAreaPseudo,
  interactionMotion,
  pendingBusy,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { usePendingNavigation } from "@/components/ui/use-pending-navigation";
import { cn } from "@/lib/utils";

/**
 * A link that can be the one you are on. Contract:
 * docs/specs/component/nav-link.md
 *
 * An anchor, never a button: these navigate, so middle-click, open-in-new-tab
 * and the screen reader's link list all have to work.
 */
export const navLinkVariants = cva(
  [
    hitAreaAnchor,
    "inline-flex items-center justify-center whitespace-nowrap",
    touchTarget,
    "h-9 rounded-pill px-3 text-sm font-medium",
    hitAreaPseudo,
    hitAreaExpandNav,
    interactionMotion,
    focusRing,
    pressScale,
    disabledState,
  ],
  {
    variants: {
      current: {
        true: "bg-accent-soft text-ink",
        false: "text-muted hover:bg-accent-soft hover:text-ink",
      },
    },
    defaultVariants: { current: false },
  },
);

export type NavLinkProps = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof navLinkVariants>;

export function NavLink({ current, className, href, onClick, ...props }: NavLinkProps) {
  const { isPending, onClick: pendingClick } = usePendingNavigation(href);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      aria-busy={isPending || undefined}
      className={cn(navLinkVariants({ current }), isPending && pendingBusy, className)}
      onClick={(event) => {
        pendingClick(event);
        onClick?.(event);
      }}
      {...props}
    />
  );
}
