"use client";

import { useCallback, useEffect, useState } from "react";

import {
  buildMethodsHref,
  type SearchParams,
} from "@/lib/method-menu-filter";
import {
  TIME_SCALE_STEP_COUNT,
  budgetFromStepIndex,
  stepIndexFromBudget,
  timeBudgetToParam,
  type TimeBudget,
} from "@/lib/time-scale";

import { copy, formatTimeBudget } from "./content";

type TimeSliderProps = {
  searchParams: SearchParams;
  value: TimeBudget;
};

export function TimeSlider({ searchParams, value }: TimeSliderProps) {
  const [step, setStep] = useState(() => stepIndexFromBudget(value));

  useEffect(() => {
    setStep(stepIndexFromBudget(value));
  }, [value]);

  const apply = useCallback(
    (nextStep: number) => {
      const budget = budgetFromStepIndex(nextStep);
      const href = buildMethodsHref(searchParams, { minutes: timeBudgetToParam(budget) });
      window.location.assign(href);
    },
    [searchParams],
  );

  const budget = budgetFromStepIndex(step);

  return (
    <div className="max-w-md">
      <div className="flex items-baseline justify-between gap-4">
        <output htmlFor="time-slider" className="text-lg font-semibold text-ink">
          {formatTimeBudget(budget)}
        </output>
        <span className="text-sm text-muted">{copy.timeScaleHint}</span>
      </div>
      <input
        id="time-slider"
        type="range"
        min={0}
        max={TIME_SCALE_STEP_COUNT - 1}
        step={1}
        value={step}
        onChange={(event) => setStep(Number(event.target.value))}
        onPointerUp={(event) => apply(Number((event.target as HTMLInputElement).value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-pill bg-accent-soft accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label={copy.timeLabel}
        aria-valuemin={0}
        aria-valuemax={TIME_SCALE_STEP_COUNT - 1}
        aria-valuenow={step}
        aria-valuetext={formatTimeBudget(budget)}
      />
    </div>
  );
}
