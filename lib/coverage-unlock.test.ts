import { describe, expect, it } from "vitest";

import type { CoverageHistoryRow } from "@/lib/coverage";
import {
  countMovedToComfortableThisMonth,
  unlockLineForSource,
} from "@/lib/coverage-unlock";

const row = (
  coveragePercent: number,
  measuredAt: string,
  calibrationDated: string | null = null,
): CoverageHistoryRow => ({
  measuredAt,
  coveragePercent,
  calibrationDated,
});

describe("coverage-unlock · monthly rollup", () => {
  const augustMid = Date.parse("2026-08-15T12:00:00.000Z");

  it("counts a source that crossed into comfortable this month", () => {
    const history = [
      row(88, "2026-08-10T10:00:00.000Z"),
      row(96, "2026-08-18T10:00:00.000Z"),
    ];
    const count = countMovedToComfortableThisMonth(
      [{ sourceId: "a", history, currentPercent: 96 }],
      augustMid,
    );
    expect(count).toBe(1);
  });

  it("does not count a source that was already comfortable all month", () => {
    const history = [row(96, "2026-08-05T10:00:00.000Z")];
    const count = countMovedToComfortableThisMonth(
      [{ sourceId: "a", history, currentPercent: 97 }],
      augustMid,
    );
    expect(count).toBe(0);
  });

  it("does not count a demanding source that never crossed this month", () => {
    const history = [row(80, "2026-08-05T10:00:00.000Z")];
    const count = countMovedToComfortableThisMonth(
      [{ sourceId: "a", history, currentPercent: 88 }],
      augustMid,
    );
    expect(count).toBe(0);
  });

  it("ignores crossings outside the current month", () => {
    const history = [
      row(88, "2026-07-20T10:00:00.000Z"),
      row(96, "2026-07-25T10:00:00.000Z"),
    ];
    const count = countMovedToComfortableThisMonth(
      [{ sourceId: "a", history, currentPercent: 96 }],
      augustMid,
    );
    expect(count).toBe(0);
  });
});

describe("coverage-unlock · source detail line", () => {
  it("shows before and after when a demanding snapshot exists and current is comfortable", () => {
    const history = [row(84, "2026-05-12T10:00:00.000Z")];
    const line = unlockLineForSource(history, 96.2);
    expect(line).toEqual({
      beforePercent: 84,
      measuredAt: "2026-05-12T10:00:00.000Z",
      afterPercent: 96.2,
    });
  });

  it("returns null when current coverage is still demanding", () => {
    const history = [row(84, "2026-05-12T10:00:00.000Z")];
    expect(unlockLineForSource(history, 88)).toBeNull();
  });

  it("returns null when no demanding history exists", () => {
    expect(unlockLineForSource([row(96, "2026-08-01T10:00:00.000Z")], 97)).toBeNull();
  });
});
