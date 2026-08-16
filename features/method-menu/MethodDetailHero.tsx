import Image from "next/image";

import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

export type MethodDetailHeroProps = {
  section: Section;
  className?: string;
};

/**
 * Full-width section graphic with fade into the page — title lives below, not on
 * the image. Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailHero({ section, className }: MethodDetailHeroProps) {
  const src = sectionGraphicSrc[section];
  const label = sectionGraphicAlt(section, "");

  return (
    <div
      className={cn(
        "relative -mx-6 h-44 overflow-hidden sm:-mx-0 sm:rounded-card",
        className,
      )}
    >
      <Image
        src={src}
        alt={label}
        fill
        priority
        sizes="(max-width: 640px) 100vw, 42rem"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent"
        aria-hidden
      />
    </div>
  );
}
