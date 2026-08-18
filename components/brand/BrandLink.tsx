"use client";

import { BrandMark } from "@/components/brand/BrandMark";
import { IconLink } from "@/components/ui/IconLink";
import { site } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

type BrandLinkProps = {
  href: string;
  className?: string;
};

/**
 * Header brand chip — round floating control matching shell icon links.
 * Colored mark on transparent; the chip supplies the surface.
 */
export function BrandLink({ href, className }: BrandLinkProps) {
  return (
    <IconLink href={href} aria-label={site.name} className={cn("shrink-0", className)}>
      <BrandMark size="sm" tone="color" />
    </IconLink>
  );
}
