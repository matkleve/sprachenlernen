"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import {
  navCurrentFill,
  disabledState,
  focusRing,
  hitAreaAnchor,
  hitAreaExpandNav,
  hitAreaPseudo,
  interactiveEmphasis,
  interactionMotion,
  pendingBusy,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import type { PendingPolicy } from "@/components/ui/Button";
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
    "h-11 min-h-11 rounded-pill px-4 text-sm",
    interactiveEmphasis,
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
        true: navCurrentFill,
        false: "text-muted hover:bg-accent-soft hover:text-ink",
      },
    },
    defaultVariants: { current: false },
  },
);

export type NavLinkProps = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof navLinkVariants> & {
    /** `nav` — optimistic current fill, no dimming (shell destinations). */
    pendingPolicy?: PendingPolicy;
  };

export function NavLink({
  current,
  pendingPolicy = "cta",
  className,
  href,
  onClick,
  ...props
}: NavLinkProps) {
  const { isPending, onClick: pendingClick } = usePendingNavigation(href);
  const visuallyCurrent = current || (isPending && pendingPolicy === "nav");

  return (
    <Link
      href={href}
      aria-current={visuallyCurrent ? "page" : undefined}
      aria-busy={isPending || undefined}
      className={cn(
        navLinkVariants({ current: visuallyCurrent }),
        isPending && pendingPolicy !== "nav" && pendingBusy,
        className,
      )}
      onClick={(event) => {
        pendingClick(event);
        onClick?.(event);
      }}
      {...props}
    />
  );
}
