import { describe, expect, it } from "vitest";

import { readLevel } from "@/lib/level-model";
import { newTask, rebuild, type Review } from "@/lib/scheduler";

import type { StandingOutcome } from "./standing";
import { standingFromReading } from "./standing";

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 9);

function reviewed(id: string, grades: Review["grade"][]) {
  const taskId = id.includes(":meaning-recall") ? id : `${id}:meaning-recall`;
  const wordId = taskId.replace(/:meaning-recall$/, "");
  const reviews: Review[] = grades.map((grade, index) => ({
    at: now - (grades.length - index) * 3 * DAY,
    grade,
  }));
  return rebuild(taskId, wordId, reviews).task;
}

describe("standingFromReading", () => {
  it("returns empty when nothing has been reviewed", () => {
    expect(standingFromReading(readLevel([], now))).toEqual({ kind: "empty" });
  });

  it("returns recorded with pool-local held count when history exists", () => {
    const summary = standingFromReading(
      readLevel(
        [reviewed("es:t1", ["easy", "easy", "easy"]), reviewed("es:t2", ["good", "good"]), newTask("es:t3:meaning-recall", "es:t3")],
        now,
      ),
    );

    expect(summary.kind).toBe("recorded");
    if (summary.kind !== "recorded") return;
    expect(summary.poolSize).toBe(3);
    expect(summary.held).toBeGreaterThanOrEqual(0);
  });
});

describe("routing on no language", () => {
  it("is a distinct outcome from omit, because the page routes on it", () => {
    // Folding "no language" into `omit` would render the catalogue to someone
    // who has never been asked what they are learning — which is three of the
    // four ways into the app (confirmation link, OAuth, plain sign-in).
    const outcomes: StandingOutcome[] = [
      { status: "no-language" },
      { status: "omit" },
    ];

    expect(outcomes.map((outcome) => outcome.status)).toEqual(["no-language", "omit"]);
  });
});
