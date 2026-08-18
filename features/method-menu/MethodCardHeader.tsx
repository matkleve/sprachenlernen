"use client";

import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { useMethodMenuCopy } from "./use-method-menu-copy";
import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

const methodCardHeaderVariants = cva("relative w-full shrink-0", {
  variants: {
    size: {
      card: "h-20 bg-surface",
      hero: "h-44 bg-canvas sm:h-52",
    },
  },
  defaultVariants: {
    size: "card",
  },
});

export type MethodCardHeaderProps = {
  section: Section;
  className?: string;
} & VariantProps<typeof methodCardHeaderVariants>;

/**
 * Abstract section graphic — decorative only. Cards share one motif per section
 * so the catalogue stays scannable without 53 unique assets. Detail hero reuses
 * the same asset at `size="hero"`.
 */
export function MethodCardHeader({ section, size, className }: MethodCardHeaderProps) {
  const { sections } = useMethodMenuCopy();
  const label = sections[section];

  return (
    <div className={cn(methodCardHeaderVariants({ size }), className)}>
      <Image
        src={sectionGraphicSrc[section]}
        alt={sectionGraphicAlt(section, label)}
        fill
        unoptimized
        priority={size === "hero"}
        sizes={
          size === "hero"
            ? "100vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        className="object-cover object-center"
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
          size === "hero"
            ? "from-canvas/90 via-canvas/20"
            : "from-surface/90 via-surface/20",
        )}
        aria-hidden
      />
      <p className="absolute bottom-2 left-3 text-[0.65rem] font-medium uppercase tracking-widest text-muted sm:bottom-3 sm:left-6 sm:text-xs">
        {label}
      </p>
    </div>
  );
}
