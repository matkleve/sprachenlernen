import Image from "next/image";

import type { Section } from "@/lib/method-catalogue";

import { sections } from "./content";
import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

export type MethodCardHeaderProps = {
  section: Section;
};

/**
 * Abstract section graphic — decorative only. Cards share one motif per section
 * so the catalogue stays scannable without 53 unique assets.
 */
export function MethodCardHeader({ section }: MethodCardHeaderProps) {
  const label = sections[section];

  return (
    <div className="relative h-20 w-full shrink-0 bg-surface">
      <Image
        src={sectionGraphicSrc[section]}
        alt={sectionGraphicAlt(section, label)}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/20 to-transparent"
        aria-hidden
      />
      <p className="absolute bottom-2 left-3 text-[0.65rem] font-medium uppercase tracking-widest text-muted">
        {label}
      </p>
    </div>
  );
}
