"use client";

import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { methodSectionSurface } from "@/features/method-menu/section-surface";
import { sectionGraphicAlt, sectionGraphicSrc } from "@/features/method-menu/section-graphic";
import { useMethodMenuCopy } from "@/features/method-menu/use-method-menu-copy";
import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

type ExerciseRunnerMobileStripProps = {
  stepLabel?: string;
  stopLabel: string;
  onStop: () => void;
};

/** Mobile chrome — no hero image; step context + stop only. study/42 */
export function ExerciseRunnerMobileStrip({
  stepLabel,
  stopLabel,
  onStop,
}: ExerciseRunnerMobileStripProps) {
  return (
    <div
      className={cn(
        "flex h-[var(--height-practice-mobile-header)] shrink-0 items-center justify-between gap-2 md:hidden",
      )}
    >
      <p className="min-w-0 truncate text-base font-semibold text-ink">
        {stepLabel ?? "\u00a0"}
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onStop}
        className="shrink-0 px-2.5 text-xs"
      >
        {stopLabel}
      </Button>
    </div>
  );
}

type ExerciseRunnerHeroProps = {
  section: Section;
  sectionLabel: string;
  methodName: string;
  stepLabel?: string;
  stopLabel: string;
  onStop: () => void;
};

/**
 * Desktop hero belt — full-bleed section graphic. Hidden on mobile (`md+` only).
 * Mobile uses `ExerciseRunnerMobileStrip` instead — reviews/design/DR-043-exercise-mobile-fit-frame.md
 */
export function ExerciseRunnerHero({
  section,
  sectionLabel,
  methodName,
  stepLabel,
  stopLabel,
  onStop,
}: ExerciseRunnerHeroProps) {
  const { sections } = useMethodMenuCopy();
  const sectionName = sections[section];

  return (
    <div
      className={cn(
        methodSectionSurface(
          section,
          "relative hidden shrink-0 overflow-hidden rounded-card shadow-soft md:block",
        ),
        "h-[var(--height-practice-hero)]",
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
        <h1 className="mt-0.5 text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {methodName}
        </h1>
        {stepLabel ? (
          <p className="mt-0.5 text-xs font-medium text-muted sm:text-sm">{stepLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
