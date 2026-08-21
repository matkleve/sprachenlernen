import Link from "next/link";

import { TextLink } from "@/components/ui/TextLink";
import { bisectLevelHref } from "@/lib/safari-bisect";

import { InsetReadout } from "./InsetReadout";
import { StandaloneModeReadout } from "./StandaloneModeReadout";
import { copy } from "./content";

type BisectBannerProps = {
  basePath: string;
  level: number;
  maxLevel: number;
  levelLabels: readonly string[];
};

/**
 * Level controls for Safari body bisect routes. Contract: docs/qa/QA-031-ios-safari-pwa-test-report.md
 */
export function BisectBanner({ basePath, level, maxLevel, levelLabels }: BisectBannerProps) {
  const description = levelLabels[level] ?? levelLabels[0] ?? "";

  return (
    <div className="border-b border-line bg-accent-soft px-4 py-3 text-center text-xs leading-relaxed text-muted">
      <p className="font-medium text-ink">{copy.bannerTitle}</p>
      <p className="mt-1">{copy.levelLabel(level, maxLevel, description)}</p>
      <InsetReadout />
      <StandaloneModeReadout />
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {level > 0 ? (
          <TextLink href={bisectLevelHref(basePath, level - 1)} className="text-xs">
            {copy.previous}
          </TextLink>
        ) : null}
        {level < maxLevel ? (
          <TextLink href={bisectLevelHref(basePath, level + 1)} className="text-xs">
            {copy.next}
          </TextLink>
        ) : null}
        <TextLink href="/safari-bisect" className="text-xs">
          {copy.hubLink}
        </TextLink>
      </div>
      <ul className="mt-3 space-y-1 text-left text-[11px]">
        {levelLabels.map((label, index) => (
          <li key={label}>
            <Link
              href={bisectLevelHref(basePath, index)}
              className={index === level ? "font-semibold text-ink underline" : "text-muted hover:text-ink"}
            >
              {index}. {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
