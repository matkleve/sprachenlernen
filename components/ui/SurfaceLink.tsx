"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  cardInteractive,
  pendingBusy,
  pressFill,
} from "@/components/ui/interaction-kernel";
import { usePendingNavigation } from "@/components/ui/use-pending-navigation";
import { cn } from "@/lib/utils";

type SurfaceLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
};

/**
 * Card-shaped navigation link — method cards, list rows that navigate.
 * Contract: docs/specs/system/interaction-registry.json
 */
export function SurfaceLink({ className, href, children, onClick, ...props }: SurfaceLinkProps) {
  const { isPending, onClick: pendingClick } = usePendingNavigation(href);

  return (
    <Link
      href={href}
      aria-busy={isPending || undefined}
      className={cn(
        "block rounded-card",
        cardInteractive,
        pressFill,
        isPending && pendingBusy,
        className,
      )}
      onClick={(event) => {
        pendingClick(event);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
