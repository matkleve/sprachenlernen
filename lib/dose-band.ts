/**
 * The dose band — how many hours a level costs. Contract:
 * docs/specs/service/dose-band.md, deriving study/25 C4 (F184).
 *
 * This is the denominator no product in the category shows. It needs no
 * learner data at all: the bands are published, and the arithmetic against a
 * daily habit is one division. Framework-free and I/O-free.
 *
 * **The band is borrowed, and that is the answer to roadmap question 19** — the
 * question offers two: label it as borrowed, or calibrate and date it per
 * language pair (F190). The second needs calibration data that does not exist,
 * so this file takes the first and makes the borrowing structural rather than
 * a footnote: `DOSE_BAND_SOURCE.calibratedFor` is null, and any surface showing
 * a figure from here has to say so.
 */

export type CefrLevel = "A1" | "A2" | "B1" | "B2";

export type DoseBand = {
  level: CefrLevel;
  /** Cumulative guided hours from a standing start, not hours per level. */
  minHours: number;
  maxHours: number;
};

/** study/25 C4, from Cambridge/ALTE's published guided-learning-hour bands. */
export const DOSE_BANDS: readonly DoseBand[] = [
  { level: "A1", minHours: 90, maxHours: 100 },
  { level: "A2", minHours: 180, maxHours: 200 },
  { level: "B1", minHours: 350, maxHours: 400 },
  { level: "B2", minHours: 500, maxHours: 600 },
];

export const DOSE_BAND_SOURCE = {
  name: "Cambridge/ALTE guided learning hours",
  /** English-derived and institutional — study/25 C4 says so in its own text. */
  borrowed: true,
  /**
   * Null on purpose, and it is the whole of question 19's first branch. When a
   * language pair is ever calibrated (F190), this stops being null and the
   * surfaces that read it stop having to caveat. Until then a figure from this
   * table is an order-of-magnitude guide.
   */
  calibratedFor: null as string | null,
} as const;

const DAYS_PER_YEAR = 365;

/**
 * study/25 C4's own arithmetic: fifteen minutes a day, every day, is 91 hours
 * a year. The chapter's number, reproduced rather than restated, so that if
 * this ever disagrees with the chapter one of them is wrong.
 */
export function hoursPerYear(minutesPerDay: number): number {
  if (!Number.isFinite(minutesPerDay) || minutesPerDay <= 0) return 0;
  return (minutesPerDay * DAYS_PER_YEAR) / 60;
}

export type YearsToReach = { minYears: number; maxYears: number };

/**
 * How long a level takes at a given daily habit. Returns null rather than
 * Infinity at a pace of zero — "never" is not a duration, and a surface that
 * received Infinity would render it.
 */
export function yearsToReach(level: CefrLevel, minutesPerDay: number): YearsToReach | null {
  const band = DOSE_BANDS.find((entry) => entry.level === level);
  if (!band) return null;

  const perYear = hoursPerYear(minutesPerDay);
  if (perYear <= 0) return null;

  return { minYears: band.minHours / perYear, maxYears: band.maxHours / perYear };
}
