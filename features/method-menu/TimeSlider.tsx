"use client";

import { useCallback, useEffect, useState } from "react";

import { buildMethodsHref, MAX_MINUTES, MIN_MINUTES, type SearchParams } from "@/lib/method-menu-filter";

import { copy } from "./content";

type TimeSliderProps = {
  searchParams: SearchParams;
  value?: number;
};

export function TimeSlider({ searchParams, value = 15 }: TimeSliderProps) {
  const [minutes, setMinutes] = useState(value);

  useEffect(() => {
    setMinutes(value);
  }, [value]);

  const apply = useCallback(
    (next: number) => {
      const href = buildMethodsHref(searchParams, { minutes: String(next) });
      window.location.assign(href);
    },
    [searchParams],
  );

  return (
    <div className="max-w-md">
      <div className="flex items-baseline justify-between gap-4">
        <output htmlFor="time-slider" className="text-lg font-semibold text-ink">
          {minutes} {copy.minutes}
        </output>
        <span className="text-sm text-muted">
          {MIN_MINUTES}–{MAX_MINUTES} {copy.minutes}
        </span>
      </div>
      <input
        id="time-slider"
        type="range"
        min={MIN_MINUTES}
        max={MAX_MINUTES}
        step={1}
        value={minutes}
        onChange={(event) => setMinutes(Number(event.target.value))}
        onPointerUp={(event) => apply(Number((event.target as HTMLInputElement).value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-pill bg-accent-soft accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label={copy.timeLabel}
        aria-valuemin={MIN_MINUTES}
        aria-valuemax={MAX_MINUTES}
        aria-valuenow={minutes}
      />
    </div>
  );
}
