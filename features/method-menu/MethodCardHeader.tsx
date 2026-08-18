"use client";

import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { sectionSoftBackground } from "./section-surface";
import { useMethodMenuCopy } from "./use-method-menu-copy";
import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

const sectionHeaderFade: Record<Section, string> = {
  reading:
    "from-section-reading-soft from-0% via-section-reading-soft/70 via-50% to-transparent to-100%",
  listening:
    "from-section-listening-soft from-0% via-section-listening-soft/70 via-50% to-transparent to-100%",
  speaking:
    "from-section-speaking-soft from-0% via-section-speaking-soft/70 via-50% to-transparent to-100%",
  writing:
    "from-section-writing-soft from-0% via-section-writing-soft/70 via-50% to-transparent to-100%",
  form: "from-section-form-soft from-0% via-section-form-soft/70 via-50% to-transparent to-100%",
  vocabulary:
    "from-section-vocabulary-soft from-0% via-section-vocabulary-soft/70 via-50% to-transparent to-100%",
  world:
    "from-section-world-soft from-0% via-section-world-soft/70 via-50% to-transparent to-100%",
  commitments:
    "from-section-commitments-soft from-0% via-section-commitments-soft/70 via-50% to-transparent to-100%",
};

const methodCardHeaderVariants = cva("relative w-full shrink-0 overflow-hidden", {
  variants: {
    size: {
      card: "h-28",
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
  const isCard = size !== "hero";

  return (
    <div
      className={cn(
        methodCardHeaderVariants({ size }),
        isCard ? sectionSoftBackground[section] : undefined,
        className,
      )}
    >
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
        className={cn(
          "object-cover object-top",
          isCard ? undefined : "object-center",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
          size === "hero"
            ? "from-canvas/90 via-canvas/20"
            : sectionHeaderFade[section],
        )}
        aria-hidden
      />
      <p className="absolute bottom-2 left-3 sm:bottom-3 sm:left-6">
        <span
          className={cn(
            "text-[0.65rem] font-medium uppercase tracking-widest sm:text-xs",
            isCard
              ? "rounded-sm bg-surface/70 px-1.5 py-0.5 text-ink backdrop-blur-[2px]"
              : "text-muted",
          )}
        >
          {label}
        </span>
      </p>
    </div>
  );
}
