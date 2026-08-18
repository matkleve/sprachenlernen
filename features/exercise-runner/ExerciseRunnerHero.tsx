"use client";

import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { methodSectionSurface } from "@/features/method-menu/section-surface";
import { sectionGraphicAlt, sectionGraphicSrc } from "@/features/method-menu/section-graphic";
import { useMethodMenuCopy } from "@/features/method-menu/use-method-menu-copy";
import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

type ExerciseRunnerHeroProps = {
  section: Section;
  sectionLabel: string;
  methodName: string;
  stepLabel?: string;
  compact?: boolean;
  stopLabel: string;
  onStop: () => void;
};

/**
 * Full-bleed section graphic with titles on the gradient — same asset family as
 * method cards, sized for the practice runner (not the tiny card header crop).
 */
export function ExerciseRunnerHero({
  section,
  sectionLabel,
  methodName,
  stepLabel,
  compact = false,
  stopLabel,
  onStop,
}: ExerciseRunnerHeroProps) {
  const { sections } = useMethodMenuCopy();
  const sectionName = sections[section];

  return (
    <div
      className={cn(
        methodSectionSurface(section, "relative shrink-0 overflow-hidden rounded-card shadow-soft"),
        compact ? "h-[var(--height-practice-hero)]" : "h-44 sm:h-52",
      )}
    >
      <Image
        src={sectionGraphicSrc[section]}
        alt={sectionGraphicAlt(section, sectionName)}
        fill
        unoptimized
        priority
        sizes="(max-width: 640px) 100vw, 42rem"
        className="object-cover object-[center_32%] scale-105"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/75 via-45% to-transparent to-100%"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-3 flex justify-end px-3 sm:px-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onStop}
          className="bg-surface/90 shadow-soft backdrop-blur-sm"
        >
          {stopLabel}
        </Button>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-5 sm:px-4 sm:pb-3">
        <p className="text-[0.6rem] font-medium uppercase tracking-widest text-muted sm:text-[0.65rem]">
          {sectionName}
        </p>
        <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-widest text-muted sm:text-xs">
          {sectionLabel}
        </p>
        <h1
          className={cn(
            "mt-0.5 font-semibold leading-snug text-ink",
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
          )}
        >
          {methodName}
        </h1>
        {stepLabel ? (
          <p className="mt-0.5 text-xs font-medium text-muted sm:text-sm">{stepLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
