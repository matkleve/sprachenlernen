import { describe, expect, it } from "vitest";

import { readLevel } from "@/lib/level-model";
import { newTask, rebuild, type Review } from "@/lib/scheduler";

import { standingFromReading } from "./standing";

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 9);

function reviewed(id: string, grades: Review["grade"][]) {
  const reviews: Review[] = grades.map((grade, index) => ({
    at: now - (grades.length - index) * 3 * DAY,
    grade,
  }));
  return rebuild(id, `word:${id}`, reviews).task;
}

describe("standingFromReading", () => {
  it("returns empty when nothing has been reviewed", () => {
    expect(standingFromReading(readLevel([], now))).toEqual({ kind: "empty" });
  });

  it("returns recorded with pool-local held count when history exists", () => {
    const summary = standingFromReading(
      readLevel(
        [reviewed("t1", ["easy", "easy", "easy"]), reviewed("t2", ["good", "good"]), newTask("t3", "w")],
        now,
      ),
    );

    expect(summary.kind).toBe("recorded");
    if (summary.kind !== "recorded") return;
    expect(summary.poolSize).toBe(3);
    expect(summary.held).toBeGreaterThanOrEqual(0);
  });
});
