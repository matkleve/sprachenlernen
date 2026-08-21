"use client";

import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import type { Section } from "@/lib/method-catalogue";
import type { CardDestinationMarker } from "@/lib/method-session";
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
      card: "h-20 sm:h-24 md:h-28 lg:h-24",
      hero: "h-44 bg-canvas sm:h-52",
      /** Runnable / material-setup detail — shorter on phone so chips + Start stay in view. */
      heroCompact: "h-28 bg-canvas md:h-44 lg:h-52",
    },
  },
  defaultVariants: {
    size: "card",
  },
});

const headerQuietLabel =
  "text-[0.65rem] font-medium uppercase tracking-widest text-muted sm:text-xs";

/** Text-only marker inside the card link — not a nested control. */
const destinationMarkerVariants = cva("text-sm", {
  variants: {
    destination: {
      info: "text-muted",
      start: "font-medium text-ink",
    },
  },
});

export type MethodCardHeaderProps = {
  section: Section;
  /** Card variant only — Start opens session; Info opens detail. */
  destination?: CardDestinationMarker;
  className?: string;
} & VariantProps<typeof methodCardHeaderVariants>;

/**
 * Abstract section graphic — decorative only. Cards share one motif per section
 * so the catalogue stays scannable without 53 unique assets. Detail hero reuses
 * the same asset at `size="hero"`.
 */
export function MethodCardHeader({
  section,
  size,
  destination,
  className,
}: MethodCardHeaderProps) {
  const { t, sections } = useMethodMenuCopy();
  const label = sections[section];
  const headerSize = size ?? "card";
  const isCard = headerSize === "card";
  const isHero = headerSize === "hero" || headerSize === "heroCompact";
  const markerLabel =
    isCard && destination ? t(`card.destination.${destination}` as "card.destination.start") : null;

  return (
    <div
      className={cn(
        methodCardHeaderVariants({ size: headerSize }),
        isCard ? sectionSoftBackground[section] : undefined,
        className,
      )}
    >
      <Image
        src={sectionGraphicSrc[section]}
        alt={sectionGraphicAlt(section, label)}
        fill
        unoptimized
        priority={isHero}
        sizes={
          isHero
            ? "100vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        className={cn(
          "object-cover object-top",
          size === "hero" || size === "heroCompact" ? "object-center" : undefined,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
          size === "hero" || size === "heroCompact"
            ? "from-canvas/90 via-canvas/20"
            : sectionHeaderFade[section],
        )}
        aria-hidden
      />
      {markerLabel && destination ? (
        <p className="absolute right-3 top-1.5 sm:right-4 sm:top-2">
          <span className={destinationMarkerVariants({ destination })}>{markerLabel}</span>
        </p>
      ) : null}
      <p className="absolute bottom-1.5 left-3 sm:bottom-2 sm:left-4">
        <span className={cn(isCard ? headerQuietLabel : "text-muted")}>{label}</span>
      </p>
    </div>
  );
}
