import { describe, expect, it } from "vitest";

import {
  DOSE_BANDS,
  DOSE_BAND_SOURCE,
  hoursPerYear,
  yearsToReach,
} from "@/lib/dose-band";

/**
 * Contract: docs/specs/service/dose-band.md, deriving study/25 C4.
 */

describe("the band", () => {
  it("is cumulative and strictly increasing", () => {
    // Cumulative from a standing start, not per level. If someone ever reads
    // these as per-level costs, B2 becomes 600 hours instead of 600 total and
    // the whole display is out by a factor of four.
    for (const band of DOSE_BANDS) {
      expect(band.minHours, band.level).toBeLessThan(band.maxHours);
    }

    for (let index = 1; index < DOSE_BANDS.length; index += 1) {
      const previous = DOSE_BANDS[index - 1]!;
      const current = DOSE_BANDS[index]!;
      expect(current.minHours, `${current.level} after ${previous.level}`).toBeGreaterThan(
        previous.maxHours,
      );
    }
  });

  it("carries the numbers study/25 C4 publishes", () => {
    expect(DOSE_BANDS.find((band) => band.level === "B1")).toEqual({
      level: "B1",
      minHours: 350,
      maxHours: 400,
    });
  });

  it("is marked borrowed and calibrated for nothing", () => {
    // Question 19's first branch, asserted rather than left in a comment. The
    // day this stops being null, a surface may drop its caveat — and not before.
    expect(DOSE_BAND_SOURCE.borrowed).toBe(true);
    expect(DOSE_BAND_SOURCE.calibratedFor).toBeNull();
  });
});

describe("the arithmetic", () => {
  it("reproduces the chapter's 91 hours a year at fifteen minutes a day", () => {
    expect(hoursPerYear(15)).toBeCloseTo(91.25, 2);
  });

  it("puts B1 at roughly four years of a fifteen-minute habit", () => {
    // The chapter's actual point: a perfect year of fifteen minutes buys about
    // a quarter of the way to B1. If this test ever reads "one year", the
    // band has been misread as per-level.
    const years = yearsToReach("B1", 15)!;

    expect(years.minYears).toBeCloseTo(3.84, 1);
    expect(years.maxYears).toBeCloseTo(4.38, 1);
  });

  it("returns no estimate at a pace of zero rather than infinity", () => {
    expect(yearsToReach("B1", 0)).toBeNull();
    expect(yearsToReach("B1", -5)).toBeNull();
    expect(hoursPerYear(0)).toBe(0);
  });

  it("scales inversely with the daily habit", () => {
    const fifteen = yearsToReach("B2", 15)!;
    const thirty = yearsToReach("B2", 30)!;

    expect(thirty.minYears).toBeCloseTo(fifteen.minYears / 2, 6);
  });
});
