"use client";

import type { ComponentPropsWithoutRef } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { iconButtonClass } from "@/components/ui/Button";
import { iconChipCurrentFill } from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

type IconLinkProps = Omit<ComponentPropsWithoutRef<typeof ActionLink>, "current"> & {
  /** Accent fill when this link is the active route (`aria-current="page"`). */
  current?: boolean;
};

/**
 * Round icon-only navigation link — shell profile chip, back affordances.
 * Contract: docs/specs/system/interaction-registry.json
 */
export function IconLink({
  className,
  current,
  pendingPolicy = "nav",
  ...props
}: IconLinkProps) {
  return (
    <ActionLink
      variant="floating"
      size="sm"
      pendingPolicy={pendingPolicy}
      aria-current={current ? "page" : undefined}
      className={cn(iconButtonClass, current && iconChipCurrentFill, className)}
      {...props}
    />
  );
}
