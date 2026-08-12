"use client";

import type { ComponentPropsWithoutRef } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { iconButtonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type IconLinkProps = ComponentPropsWithoutRef<typeof ActionLink>;

/**
 * Round icon-only navigation link — shell profile chip, back affordances.
 * Contract: docs/specs/system/interaction-registry.json
 */
export function IconLink({ className, pendingPolicy = "nav", ...props }: IconLinkProps) {
  return (
    <ActionLink
      variant="floating"
      size="sm"
      pendingPolicy={pendingPolicy}
      className={cn(iconButtonClass, className)}
      {...props}
    />
  );
}
