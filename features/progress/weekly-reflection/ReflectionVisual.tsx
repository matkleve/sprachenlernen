"use client";

import { useTranslations } from "next-intl";

import type { ReflectionVisual } from "@/lib/weekly-reflection";

/**
 * Chart slots for reflection cards — token colours only.
 * Contract: docs/specs/component/reflection-deck.md
 */

export function ReflectionVisual({ visual }: { visual: ReflectionVisual }) {
  const t = useTranslations("progress.weeklyReflection.visual");

  switch (visual.kind) {
    case "band-shift":
      return (
        <figure>
          <BandBars
            counts={visual.before}
            label={t("beforeWeek")}
            ariaLabel={t("bandBarsAria", {
              held: visual.before.held,
              fragile: visual.before.fragile,
              newCount: visual.before.new,
            })}
          />
          <BandBars
            counts={visual.after}
            label={t("afterWeek")}
            className="mt-4"
            ariaLabel={t("bandBarsAria", {
              held: visual.after.held,
              fragile: visual.after.fragile,
              newCount: visual.after.new,
            })}
          />
          <figcaption className="mt-3 text-sm text-muted">
            {visual.movedToHeld === 1
              ? t("bandShiftCaptionOne")
              : t("bandShiftCaption", { count: visual.movedToHeld })}
          </figcaption>
        </figure>
      );
    case "horizon":
      return (
        <figure>
          <HorizonBars bins={visual.bins} ariaLabel={horizonAria(visual.bins, t)} />
          <figcaption className="mt-3 text-sm text-muted">{t("horizonCaption")}</figcaption>
        </figure>
      );
    case "review-activity":
      return (
        <figure>
          <p className="text-3xl font-semibold tabular-nums text-ink">{visual.reviewCount}</p>
          <figcaption className="mt-2 text-sm text-muted">
            {visual.reviewCount === 1
              ? t("reviewActivityCaptionOne")
              : t("reviewActivityCaption")}
          </figcaption>
        </figure>
      );
    default:
      return null;
  }
}

function BandBars({
  counts,
  label,
  className,
  ariaLabel,
}: {
  counts: { held: number; fragile: number; new: number };
  label: string;
  className?: string;
  ariaLabel: string;
}) {
  const total = Math.max(counts.held + counts.fragile + counts.new, 1);
  const segments = [
    { key: "held", value: counts.held, className: "bg-accent" },
    { key: "fragile", value: counts.fragile, className: "bg-accent-soft" },
    { key: "new", value: counts.new, className: "bg-line-strong" },
  ] as const;

  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-2 flex h-4 overflow-hidden rounded-pill" role="img" aria-label={ariaLabel}>
        {segments.map((segment) =>
          segment.value > 0 ? (
            <div
              key={segment.key}
              className={segment.className}
              style={{ width: `${(segment.value / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

function HorizonBars({
  bins,
  ariaLabel,
}: {
  bins: readonly { dayOffset: number; count: number }[];
  ariaLabel: string;
}) {
  const max = Math.max(...bins.map((bin) => bin.count), 1);
  const sample = bins.filter((_, index) => index % 5 === 0);

  return (
    <div className="flex h-28 items-end gap-1" role="img" aria-label={ariaLabel}>
      {sample.map((bin) => (
        <div key={bin.dayOffset} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-accent-soft"
            style={{ height: `${(bin.count / max) * 100}%`, minHeight: bin.count > 0 ? "4px" : "0" }}
          />
          <span className="text-[10px] tabular-nums text-muted">{bin.dayOffset}</span>
        </div>
      ))}
    </div>
  );
}

function horizonAria(
  bins: readonly { dayOffset: number; count: number }[],
  t: ReturnType<typeof useTranslations<"progress.weeklyReflection.visual">>,
) {
  const peak = bins.reduce((best, bin) => (bin.count > best.count ? bin : best), bins[0]!);
  return t("horizonAria", { count: peak.count, dayOffset: peak.dayOffset });
}
