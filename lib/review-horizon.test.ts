import { describe, expect, it } from "vitest";

import {
  aggregateHorizonWeeks,
  buildHorizonDisplay,
  deriveHorizonCausal,
  formatHorizonAvgPerDay,
  tileCountForReviews,
} from "@/lib/review-horizon";
import { HORIZON_DAYS, type HorizonBin } from "@/lib/vocabulary-snapshot";

const DAY_MS = 86_400_000;
const now = Date.UTC(2026, 7, 12);

function emptyHorizon(): HorizonBin[] {
  return Array.from({ length: HORIZON_DAYS }, (_, dayOffset) => ({ dayOffset, count: 0 }));
}

function horizonWithCounts(entries: Record<number, number>): HorizonBin[] {
  const bins = emptyHorizon();
  for (const [offset, count] of Object.entries(entries)) {
    const bin = bins[Number(offset)];
    if (bin) bin.count = count;
  }
  return bins;
}

describe("aggregateHorizonWeeks", () => {
  it("sums daily bins into four weeks", () => {
    const horizon = horizonWithCounts({ 0: 2, 6: 1, 7: 4, 14: 3 });
    const weeks = aggregateHorizonWeeks(horizon);

    expect(weeks).toHaveLength(4);
    expect(weeks[0]?.total).toBe(3);
    expect(weeks[1]?.total).toBe(4);
    expect(weeks[2]?.total).toBe(3);
    expect(weeks[0]?.avgPerDay).toBeCloseTo(3 / 7);
  });
});

describe("buildHorizonDisplay", () => {
  it("starts collapsed for routine learners", () => {
    const reviewDays = [
      now - 30 * DAY_MS,
      now - DAY_MS,
      now - 2 * DAY_MS,
      now - 3 * DAY_MS,
      now - 4 * DAY_MS,
      now - 5 * DAY_MS,
    ];
    const display = buildHorizonDisplay(emptyHorizon(), now, {
      reviewTimestamps: reviewDays,
      firstReviewByTaskId: new Map([["t1", now - 30 * DAY_MS]]),
    }, []);

    expect(display.routineLearner).toBe(true);
    expect(display.startExpanded).toBe(false);
  });

  it("starts expanded after a seven-day gap", () => {
    const display = buildHorizonDisplay(emptyHorizon(), now, {
      reviewTimestamps: [now - 10 * DAY_MS],
      firstReviewByTaskId: new Map([["t1", now - 10 * DAY_MS]]),
    }, []);

    expect(display.triggers.returnAfterGap).toBe(true);
    expect(display.startExpanded).toBe(true);
  });

  it("detects a peak week trigger", () => {
    const horizon = emptyHorizon();
    for (let day = 0; day < 7; day += 1) {
      const bin = horizon[day];
      if (bin) bin.count = 2;
    }
    for (let day = 7; day < 14; day += 1) {
      const bin = horizon[day];
      if (bin) bin.count = 20;
    }
    const display = buildHorizonDisplay(horizon, now, {
      reviewTimestamps: [now - 2 * DAY_MS],
      firstReviewByTaskId: new Map(),
    }, []);

    expect(display.triggers.peakWeek).toBe(true);
    expect(display.peakWeekIndex).toBe(1);
  });
});

describe("deriveHorizonCausal", () => {
  it("names a bulk-add day when it explains a peak week", () => {
    const addedAt = now - 14 * DAY_MS;
    const weeks = aggregateHorizonWeeks(
      horizonWithCounts(Object.fromEntries(Array.from({ length: 7 }, (_, index) => [7 + index, 10]))),
    );
    const tasks = Array.from({ length: 25 }, (_, index) => ({
      taskId: `t${index}`,
      due: now + (7 + (index % 7)) * DAY_MS,
      firstReviewAt: addedAt,
    }));

    const causal = deriveHorizonCausal(weeks, tasks, 1, now);

    expect(causal?.weekIndex).toBe(1);
    expect(causal?.cardCount).toBe(25);
    expect(causal?.addedAt).toBe(addedAt);
  });
});

describe("tileCountForReviews", () => {
  it("caps visible tiles and reports overflow", () => {
    expect(tileCountForReviews(30)).toEqual({ shown: 24, overflow: 6 });
  });
});

describe("formatHorizonAvgPerDay", () => {
  it("rounds fractional daily averages to whole numbers", () => {
    expect(formatHorizonAvgPerDay(11 / 7)).toBe(2);
    expect(formatHorizonAvgPerDay(0)).toBe(0);
  });
});
