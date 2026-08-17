import { describe, expect, it } from "vitest";

import { buildScheduleReason } from "@/lib/schedule-reason";

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 12);

describe("buildScheduleReason", () => {
  it("returns new when the task has no reviews", () => {
    expect(
      buildScheduleReason(
        { state: "learning", due: now + 3 * DAY, lastGrade: null, reviewCount: 0 },
        now,
      ),
    ).toEqual({ kind: "new" });
  });

  it("returns dueFuture with days and last grade", () => {
    expect(
      buildScheduleReason(
        { state: "review", due: now + 4 * DAY, lastGrade: "good", reviewCount: 3 },
        now,
      ),
    ).toEqual({ kind: "dueFuture", daysUntilDue: 4, lastGrade: "good" });
  });

  it("returns dueToday when due falls on the current day", () => {
    expect(
      buildScheduleReason(
        { state: "review", due: now + 2 * 60 * 60 * 1000, lastGrade: "hard", reviewCount: 2 },
        now,
      ),
    ).toEqual({ kind: "dueToday", lastGrade: "hard" });
  });

  it("returns suspended and retired kinds", () => {
    expect(
      buildScheduleReason(
        { state: "suspended", due: now - DAY, lastGrade: "again", reviewCount: 5 },
        now,
      ),
    ).toEqual({ kind: "suspended" });
    expect(
      buildScheduleReason(
        { state: "retired", due: now, lastGrade: "good", reviewCount: 1 },
        now,
      ),
    ).toEqual({ kind: "retired" });
  });
});
