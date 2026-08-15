"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { copy } from "@/features/words/content";
import {
  tileCountForReviews,
  type HorizonDisplay,
  type HorizonWeek,
} from "@/lib/review-horizon";
import type { HorizonBin } from "@/lib/vocabulary-snapshot";
import { cn } from "@/lib/utils";

type ReviewHorizonFieldProps = {
  horizon: readonly HorizonBin[];
  display: HorizonDisplay;
  now: number;
};

const DAY_MS = 86_400_000;

function formatDayLabel(dayOffset: number, now: number): string {
  if (dayOffset === 0) return copy.horizonDay(0);
  const date = new Date(now + dayOffset * DAY_MS);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function summaryLine(display: HorizonDisplay): string {
  if (display.triggers.returnAfterGap) return copy.horizonReturnPlan;
  if (display.loadTone === "light") return copy.horizonSummaryLight;
  if (display.peakWeekIndex !== null && display.triggers.peakWeek) {
    const week = display.weeks[display.peakWeekIndex];
    if (week) return copy.horizonSummaryPeakWeek(display.peakWeekIndex + 1, week.avgPerDay);
  }
  return copy.horizonSummarySteady;
}

function causalLine(display: HorizonDisplay): string | null {
  if (!display.causal) return null;
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
  }).format(new Date(display.causal.addedAt));
  return copy.horizonCausal(display.causal.weekIndex + 1, display.causal.cardCount, dateLabel);
}

function TileStack({ count }: { count: number }) {
  const { shown, overflow } = tileCountForReviews(count);
  if (count === 0) {
    return <div className="h-8 w-full border-b border-line" aria-hidden="true" />;
  }

  return (
    <div className="flex w-full flex-col-reverse gap-0.5" aria-hidden="true">
      {Array.from({ length: shown }, (_, index) => (
        <div key={index} className="h-1.5 w-full rounded-pill bg-accent" />
      ))}
      {overflow > 0 ? (
        <span className="text-center text-[10px] font-medium text-muted">
          {copy.horizonTileOverflow(overflow)}
        </span>
      ) : null}
    </div>
  );
}

function WeekColumn({
  week,
  peakWeekIndex,
  open,
  onToggle,
}: {
  week: HorizonWeek;
  peakWeekIndex: number | null;
  open: boolean;
  onToggle: () => void;
}) {
  const weekNumber = week.weekIndex + 1;
  const isPeak = peakWeekIndex === week.weekIndex;

  return (
    <div className="min-w-0 flex-1">
      <Button
        type="button"
        variant="secondary"
        className="h-auto w-full flex-col items-stretch rounded-card p-2 text-left"
        aria-expanded={open}
        aria-label={copy.horizonWeekAria(weekNumber, week.total, week.avgPerDay)}
        onClick={onToggle}
      >
        <span className="text-xs font-medium text-muted">{copy.horizonWeekLabel(weekNumber)}</span>
        <div className="mt-2 flex min-h-24 flex-1 flex-col justify-end">
          <TileStack count={week.total} />
        </div>
        <span className={cn("mt-2 text-[11px] leading-snug text-muted", isPeak && "text-ink")}>
          {copy.horizonWeekStats(week.total, week.avgPerDay)}
        </span>
      </Button>
    </div>
  );
}

function DayColumn({ dayOffset, count, now }: { dayOffset: number; count: number; now: number }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col rounded-card border border-line bg-surface-raised p-1.5">
        <span className="text-[10px] font-medium text-muted">{formatDayLabel(dayOffset, now)}</span>
        <div className="mt-1 flex min-h-16 flex-col justify-end">
          <TileStack count={count} />
        </div>
        <span className="mt-1 text-center text-[10px] tabular-nums text-muted">{count}</span>
      </div>
    </div>
  );
}

export function ReviewHorizonField({ horizon, display, now }: ReviewHorizonFieldProps) {
  const [expanded, setExpanded] = useState(display.startExpanded);
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const causal = causalLine(display);

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.horizonHeading}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.horizonCaption}</p>

      <div className="mt-4 rounded-card border border-line bg-surface-raised p-4 shadow-soft">
        <p className="max-w-2xl text-sm leading-relaxed text-ink">{summaryLine(display)}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 px-0 text-accent hover:bg-transparent"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? copy.horizonCollapse : copy.horizonExpand}
        </Button>

        {expanded ? (
          <div className="mt-4">
            <p className="mb-4 max-w-2xl text-sm text-muted">{copy.horizonScheduledNote}</p>
            <div className="flex min-w-0 gap-2" role="group" aria-label={copy.horizonCaption}>
              {display.weeks.map((week) => (
                <WeekColumn
                  key={week.weekIndex}
                  week={week}
                  peakWeekIndex={display.peakWeekIndex}
                  open={openWeek === week.weekIndex}
                  onToggle={() =>
                    setOpenWeek((current) => (current === week.weekIndex ? null : week.weekIndex))
                  }
                />
              ))}
            </div>

            {openWeek !== null ? (
              <div className="mt-4 flex min-w-0 gap-1">
                {display.weeks[openWeek]?.dayOffsets.map((dayOffset) => (
                  <DayColumn
                    key={dayOffset}
                    dayOffset={dayOffset}
                    count={horizon[dayOffset]?.count ?? 0}
                    now={now}
                  />
                ))}
              </div>
            ) : null}

            {causal ? (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink">{causal}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
