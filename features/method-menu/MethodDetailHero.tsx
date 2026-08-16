import Image from "next/image";

import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

export type MethodDetailHeroProps = {
  section: Section;
  name: string;
  className?: string;
};

/**
 * Section graphic hero with integrated title. Image shows through the title
 * where `background-clip: text` is supported; solid ink on scrim otherwise.
 * Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailHero({ section, name, className }: MethodDetailHeroProps) {
  const src = sectionGraphicSrc[section];

  return (
    <div
      className={cn(
        "relative -mx-6 h-52 overflow-hidden sm:-mx-0 sm:rounded-card",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 100vw, 42rem"
        className="object-cover object-center"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-16">
        <h1
          className="text-3xl font-semibold leading-tight tracking-tight text-ink [text-shadow:0_1px_12px_var(--color-canvas)] sm:text-4xl supports-[background-clip:text]:bg-[length:100%_auto] supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent supports-[background-clip:text]:[text-shadow:none]"
          style={{ backgroundImage: `url(${src})` }}
        >
          {name}
        </h1>
        <span className="sr-only">{sectionGraphicAlt(section, name)}</span>
      </div>
    </div>
  );
}
