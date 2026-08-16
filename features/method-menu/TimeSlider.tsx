"use client";

import { useCallback, useEffect, useState } from "react";

import {
  TIME_SCALE_STEP_COUNT,
  budgetFromStepIndex,
  stepIndexFromBudget,
  type TimeBudget,
} from "@/lib/time-scale";

import { useMethodMenuCopy } from "./use-method-menu-copy";

type TimeSliderProps = {
  value: TimeBudget;
  onChange: (budget: TimeBudget) => void;
};

export function TimeSlider({ value, onChange }: TimeSliderProps) {
  const { t, formatTimeBudget } = useMethodMenuCopy();
  const [step, setStep] = useState(() => stepIndexFromBudget(value));

  useEffect(() => {
    setStep(stepIndexFromBudget(value));
  }, [value]);

  const commit = useCallback(
    (nextStep: number) => {
      onChange(budgetFromStepIndex(nextStep));
    },
    [onChange],
  );

  const budget = budgetFromStepIndex(step);

  return (
    <div className="max-w-md">
      <div className="flex min-h-10 items-center justify-between gap-4">
        <output
          htmlFor="time-slider"
          className="shrink-0 whitespace-nowrap text-lg font-semibold leading-none text-ink"
        >
          {formatTimeBudget(budget)}
        </output>
        <span className="text-right text-sm leading-snug text-muted">{t("timeScaleHint")}</span>
      </div>
      <input
        id="time-slider"
        type="range"
        min={0}
        max={TIME_SCALE_STEP_COUNT - 1}
        step={1}
        value={step}
        onChange={(event) => setStep(Number(event.target.value))}
        onPointerUp={(event) => commit(Number((event.target as HTMLInputElement).value))}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            commit(Number((event.target as HTMLInputElement).value));
          }
        }}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-pill bg-accent-soft accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label={t("timeLabel")}
        aria-valuemin={0}
        aria-valuemax={TIME_SCALE_STEP_COUNT - 1}
        aria-valuenow={step}
        aria-valuetext={formatTimeBudget(budget)}
      />
    </div>
  );
}
