import type { ReflectionVisual } from "@/lib/weekly-reflection";

import { reflectionVisualCopy } from "./content";

/**
 * Chart slots for reflection cards — token colours only.
 * Contract: docs/specs/component/reflection-deck.md
 */

export function ReflectionVisual({ visual }: { visual: ReflectionVisual }) {
  switch (visual.kind) {
    case "band-shift":
      return (
        <figure>
          <BandBars counts={visual.before} label={reflectionVisualCopy.beforeWeek} />
          <BandBars counts={visual.after} label={reflectionVisualCopy.afterWeek} className="mt-4" />
          <figcaption className="mt-3 text-sm text-muted">
            {reflectionVisualCopy.bandShiftCaption(visual.movedToHeld)}
          </figcaption>
        </figure>
      );
    case "horizon":
      return (
        <figure>
          <HorizonBars bins={visual.bins} />
          <figcaption className="mt-3 text-sm text-muted">{reflectionVisualCopy.horizonCaption}</figcaption>
        </figure>
      );
    case "review-activity":
      return (
        <figure>
          <p className="text-3xl font-semibold tabular-nums text-ink">{visual.reviewCount}</p>
          <figcaption className="mt-2 text-sm text-muted">
            {reflectionVisualCopy.reviewActivityCaption(visual.reviewCount)}
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
}: {
  counts: { held: number; fragile: number; new: number };
  label: string;
  className?: string;
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
      <div
        className="mt-2 flex h-4 overflow-hidden rounded-pill"
        role="img"
        aria-label={reflectionVisualCopy.bandBarsAria(counts)}
      >
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

function HorizonBars({ bins }: { bins: readonly { dayOffset: number; count: number }[] }) {
  const max = Math.max(...bins.map((bin) => bin.count), 1);
  const sample = bins.filter((_, index) => index % 5 === 0);

  return (
    <div
      className="flex h-28 items-end gap-1"
      role="img"
      aria-label={reflectionVisualCopy.horizonAria(bins)}
    >
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
