"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
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

function TileStack({
  count,
  overflowLabel,
}: {
  count: number;
  overflowLabel: (overflow: number) => string;
}) {
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
          {overflowLabel(overflow)}
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
  t,
}: {
  week: HorizonWeek;
  peakWeekIndex: number | null;
  open: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslations<"words">>;
}) {
  const weekNumber = week.weekIndex + 1;
  const isPeak = peakWeekIndex === week.weekIndex;

  return (
    <div className="min-w-0">
      <Button
        type="button"
        variant="secondary"
        className="h-auto w-full flex-col items-stretch whitespace-normal rounded-card p-2 text-left"
        aria-expanded={open}
        aria-label={t("horizonWeekAria", {
          week: weekNumber,
          total: week.total,
          avgPerDay: week.avgPerDay,
        })}
        onClick={onToggle}
      >
        <span className="text-center text-xs font-medium text-muted">
          {t("horizonWeekLabel", { week: weekNumber })}
        </span>
        <div className="mt-2 flex min-h-16 flex-1 flex-col justify-end sm:min-h-24">
          <TileStack
            count={week.total}
            overflowLabel={(overflow) => t("horizonTileOverflow", { overflow })}
          />
        </div>
        <span
          className={cn(
            "mt-2 block text-center text-[10px] leading-tight text-muted sm:text-[11px]",
            isPeak && "text-ink",
          )}
        >
          <span className="block">{t("horizonWeekScheduled", { total: week.total })}</span>
          <span className="mt-0.5 block tabular-nums">
            {t("horizonWeekAvgPerDay", { avgPerDay: week.avgPerDay })}
          </span>
        </span>
      </Button>
    </div>
  );
}

function DayColumn({
  dayOffset,
  count,
  now,
  t,
}: {
  dayOffset: number;
  count: number;
  now: number;
  t: ReturnType<typeof useTranslations<"words">>;
}) {
  const label =
    dayOffset === 0
      ? t("horizonDayToday")
      : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
          new Date(now + dayOffset * DAY_MS),
        );

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col rounded-card border border-line bg-surface-raised p-1.5">
        <span className="text-center text-[10px] font-medium leading-tight text-muted">{label}</span>
        <div className="mt-1 flex min-h-16 flex-col justify-end">
          <TileStack
            count={count}
            overflowLabel={(overflow) => t("horizonTileOverflow", { overflow })}
          />
        </div>
        <span className="mt-1 text-center text-[10px] tabular-nums text-muted">{count}</span>
      </div>
    </div>
  );
}

export function ReviewHorizonField({ horizon, display, now }: ReviewHorizonFieldProps) {
  const t = useTranslations("words");
  const [expanded, setExpanded] = useState(display.startExpanded);
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  const summaryLine = (() => {
    if (display.triggers.returnAfterGap) return t("horizonReturnPlan");
    if (display.loadTone === "light") return t("horizonSummaryLight");
    if (display.peakWeekIndex !== null && display.triggers.peakWeek) {
      const week = display.weeks[display.peakWeekIndex];
      if (week) {
        return t("horizonSummaryPeakWeek", {
          week: display.peakWeekIndex + 1,
          avgPerDay: week.avgPerDay,
        });
      }
    }
    return t("horizonSummarySteady");
  })();

  const causal =
    display.causal === null
      ? null
      : t("horizonCausal", {
          week: display.causal.weekIndex + 1,
          count: display.causal.cardCount,
          dateLabel: new Intl.DateTimeFormat(undefined, {
            month: "long",
            day: "numeric",
          }).format(new Date(display.causal.addedAt)),
        });

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{t("horizonHeading")}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("horizonCaption")}</p>

      <div className="mt-4 rounded-card border border-line bg-surface-raised p-4 shadow-soft">
        <p className="max-w-2xl text-sm leading-relaxed text-ink">{summaryLine}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 px-0 text-accent hover:bg-transparent"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t("horizonCollapse") : t("horizonExpand")}
        </Button>

        {expanded ? (
          <div className="mt-4">
            <p className="mb-4 max-w-2xl text-sm text-muted">{t("horizonScheduledNote")}</p>
            <div
              className="grid w-full grid-cols-4 gap-1 sm:gap-2"
              role="group"
              aria-label={t("horizonCaption")}
            >
              {display.weeks.map((week) => (
                <WeekColumn
                  key={week.weekIndex}
                  week={week}
                  peakWeekIndex={display.peakWeekIndex}
                  open={openWeek === week.weekIndex}
                  onToggle={() =>
                    setOpenWeek((current) => (current === week.weekIndex ? null : week.weekIndex))
                  }
                  t={t}
                />
              ))}
            </div>

            {openWeek !== null ? (
              <div className="mt-4 grid grid-cols-7 gap-1">
                {display.weeks[openWeek]?.dayOffsets.map((dayOffset) => (
                  <DayColumn
                    key={dayOffset}
                    dayOffset={dayOffset}
                    count={horizon[dayOffset]?.count ?? 0}
                    now={now}
                    t={t}
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
