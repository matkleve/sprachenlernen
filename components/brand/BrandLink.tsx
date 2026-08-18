"use client";

import { BrandMarkAnimated } from "@/components/brand/BrandMarkAnimated";
import { ActionLink } from "@/components/ui/ActionLink";
import { iconGhostButtonClass } from "@/components/ui/Button";
import { site } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

type BrandLinkProps = {
  href: string;
  className?: string;
};

/**
 * Header brand control — ghost icon chip (no fill at rest), colored spiral
 * counter-rotates on hover. Matches header icon row gap via ShellHeaderBar.
 */
export function BrandLink({ href, className }: BrandLinkProps) {
  return (
    <ActionLink
      href={href}
      variant="ghost"
      size="sm"
      pendingPolicy="nav"
      aria-label={site.name}
      className={cn(iconGhostButtonClass, "group", className)}
    >
      <BrandMarkAnimated size="sm" />
    </ActionLink>
  );
}
