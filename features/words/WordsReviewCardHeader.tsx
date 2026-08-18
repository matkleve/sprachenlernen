import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { wordsReviewGraphicAlt, wordsReviewGraphicSrc } from "./words-home-graphic";

/**
 * Abstract review graphic — decorative only. Contract:
 * docs/specs/feature/words-home.md
 */
export async function WordsReviewCardHeader() {
  const t = await getTranslations("words");
  const label = t("reviewCardHeaderLabel");

  return (
    <div className="relative h-24 w-full shrink-0 bg-surface">
      <Image
        src={wordsReviewGraphicSrc}
        alt={wordsReviewGraphicAlt(label)}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover object-[center_30%]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface from-0% via-surface/60 via-[40%] to-transparent to-100%"
        aria-hidden
      />
      <p className="absolute bottom-2 left-3 sm:bottom-3 sm:left-6">
        <span className="rounded-sm bg-surface/70 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-widest text-ink backdrop-blur-[2px] sm:text-xs">
          {label}
        </span>
      </p>
    </div>
  );
}
