import Image from "next/image";

import { copy } from "./content";
import { wordsReviewGraphicAlt, wordsReviewGraphicSrc } from "./words-home-graphic";

/**
 * Abstract review graphic — decorative only. Contract:
 * docs/specs/feature/words-home.md
 */
export function WordsReviewCardHeader() {
  const label = copy.reviewHeading;

  return (
    <div className="relative h-20 w-full shrink-0 bg-surface">
      <Image
        src={wordsReviewGraphicSrc}
        alt={wordsReviewGraphicAlt(label)}
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
