import { describe, expect, it } from "vitest";

import {
  GRADES,
  applyReview,
  DEFAULT_CONFIG,
  newTask,
  project,
  rebuild,
  retire,
  retrievability,
  type Grade,
  type Review,
  type Task,
} from "@/lib/scheduler";

/**
 * Contract: docs/specs/service/scheduler.md — one test per AC, named after it.
 *
 * `now` is always explicit. A test that reaches for Date.now() cannot check
 * AC-8 or AC-9, which is exactly why the spec forbids the module from doing it.
 */

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 0, 1);

/** Drive a task through a sequence of grades, one day apart by default. */
const sequence = (grades: Grade[], gapDays = 1, from = T0): Task => {
  let task = newTask("t1", "word-1");
  let at = from;
  for (const grade of grades) {
    task = applyReview(task, grade, at, DEFAULT_CONFIG).task;
    at += gapDays * DAY;
  }
  return task;
};

describe("scheduler · AC-1 a task with no reviews is new and due now", () => {
  it("starts in state new", () => {
    expect(newTask("t1", "word-1").state).toBe("new");
  });

  it("is due at or before now", () => {
    expect(newTask("t1", "word-1").due).toBeLessThanOrEqual(T0);
  });

  it("has no stability yet", () => {
    expect(newTask("t1", "word-1").stability).toBeUndefined();
  });
});

describe("scheduler · AC-2 stability is ordered by grade", () => {
  it("orders again < hard < good < easy on a fresh task", () => {
    const stabilities = GRADES.map(
      (grade) => applyReview(newTask("t1", "w"), grade, T0, DEFAULT_CONFIG).task.stability!,
    );
    const sorted = [...stabilities].sort((a, b) => a - b);
    expect(stabilities).toEqual(sorted);
    expect(new Set(stabilities).size).toBe(GRADES.length);
  });

  it("orders again < hard < good < easy on a mature task", () => {
    const mature = sequence(["good", "good", "good"], 5);
    const stabilities = GRADES.map(
      (grade) => applyReview(mature, grade, T0 + 30 * DAY, DEFAULT_CONFIG).task.stability!,
    );
    expect(stabilities).toEqual([...stabilities].sort((a, b) => a - b));
  });
});

describe("scheduler · AC-3 a good review lengthens the interval", () => {
  it("grows the interval on each successful review", () => {
    let task = sequence(["good", "good"], 1);
    let at = T0 + 2 * DAY;
    let previous = 0;

    for (let i = 0; i < 5; i++) {
      const next = applyReview(task, "good", at, DEFAULT_CONFIG).task;
      const interval = (next.due - at) / DAY;
      expect(interval).toBeGreaterThan(previous);
      previous = interval;
      at = next.due;
      task = next;
    }
  });
});

describe("scheduler · AC-4 retrievability at the due date equals target retention", () => {
  it.each([0.8, 0.85, 0.9, 0.95])("holds for target %s", (target) => {
    const config = { ...DEFAULT_CONFIG, targetRetention: target };
    let task = newTask("t1", "w");
    task = applyReview(task, "good", T0, config).task;
    task = applyReview(task, "good", task.due, config).task;

    // The spec's tolerance is 0.02, not vitest's toBeCloseTo(…, 2) which is
    // 0.005. Interval rounding to whole days costs a few thousandths at high
    // target retention, so the looser figure in the spec is the real contract.
    expect(Math.abs(retrievability(task, task.due) - target)).toBeLessThan(0.02);
  });
});

describe("scheduler · AC-5 a suspended task ignores grades and reports why", () => {
  const suspend = () => {
    const lapses = Array.from<unknown, Grade>(
      { length: DEFAULT_CONFIG.lapseThreshold + 1 },
      () => "again",
    );
    return sequence(["good", "good", ...lapses], 3);
  };

  it("reaches suspended", () => {
    expect(suspend().state).toBe("suspended");
  });

  it("leaves state and due untouched", () => {
    const task = suspend();
    const result = applyReview(task, "good", T0 + 99 * DAY, DEFAULT_CONFIG);
    expect(result.task).toEqual(task);
  });

  it("reports the transition as illegal instead of throwing", () => {
    const result = applyReview(suspend(), "good", T0 + 99 * DAY, DEFAULT_CONFIG);
    expect(result.illegal).toBe(true);
    expect(result.reason).toMatch(/suspended/i);
  });
});

describe("scheduler · AC-6 a lapse relearns and never eases difficulty", () => {
  it("moves review → relearning", () => {
    const mature = sequence(["good", "good", "good"], 4);
    expect(mature.state).toBe("review");
    expect(applyReview(mature, "again", T0 + 20 * DAY, DEFAULT_CONFIG).task.state).toBe(
      "relearning",
    );
  });

  it("does not decrease difficulty", () => {
    const mature = sequence(["good", "good", "good"], 4);
    const after = applyReview(mature, "again", T0 + 20 * DAY, DEFAULT_CONFIG).task;
    expect(after.difficulty).toBeGreaterThanOrEqual(mature.difficulty);
  });
});

describe("scheduler · AC-7 raising target retention shortens intervals", () => {
  it("produces a shorter interval at 0.95 than at 0.85", () => {
    const history: Grade[] = ["good", "good", "good"];
    const intervalFor = (targetRetention: number) => {
      const config = { ...DEFAULT_CONFIG, targetRetention };
      let task = newTask("t1", "w");
      let at = T0;
      for (const grade of history) {
        task = applyReview(task, grade, at, config).task;
        at += 3 * DAY;
      }
      return task.due - (at - 3 * DAY);
    };

    expect(intervalFor(0.95)).toBeLessThan(intervalFor(0.85));
  });
});

describe("scheduler · AC-8 the projection matches what answering produces", () => {
  it.each(GRADES)("is exact for %s", (grade) => {
    const task = sequence(["good", "good"], 3);
    const at = T0 + 10 * DAY;

    const projected = project(task, at, DEFAULT_CONFIG);
    const actual = applyReview(task, grade, at, DEFAULT_CONFIG).task;

    expect(projected[grade].due).toBe(actual.due);
  });

  it("does not mutate the task it projects from", () => {
    const task = sequence(["good", "good"], 3);
    const before = structuredClone(task);
    project(task, T0 + 10 * DAY, DEFAULT_CONFIG);
    expect(task).toEqual(before);
  });
});

describe("scheduler · AC-9 rebuilding from the log reproduces the state", () => {
  it("matches step-by-step application", () => {
    const grades: Grade[] = ["good", "hard", "good", "again", "good", "easy", "good"];
    const reviews: Review[] = [];
    let stepwise = newTask("t1", "w");
    let at = T0;

    for (const grade of grades) {
      reviews.push({ at, grade });
      stepwise = applyReview(stepwise, grade, at, DEFAULT_CONFIG).task;
      at = stepwise.due;
    }

    expect(rebuild("t1", "w", reviews, DEFAULT_CONFIG)).toEqual(stepwise);
  });

  it("is stable when rebuilt twice", () => {
    const reviews: Review[] = [
      { at: T0, grade: "good" },
      { at: T0 + 4 * DAY, grade: "again" },
      { at: T0 + 5 * DAY, grade: "good" },
    ];
    expect(rebuild("t1", "w", reviews, DEFAULT_CONFIG)).toEqual(
      rebuild("t1", "w", reviews, DEFAULT_CONFIG),
    );
  });
});

describe("scheduler · AC-10 sibling tasks of one word do not clump", () => {
  // Deliberately skipped, not missing. The sibling gap is an open SPEC GAP in
  // docs/specs/service/scheduler.md — its value, and whether it is fixed or
  // proportional to stability, is undecided. Writing an assertion now would
  // invent the number the spec refuses to guess.
  it.skip("pushes the second task of a word beyond the sibling gap", () => {
    expect.fail("⚠ SPEC GAP: sibling gap undecided — see docs/specs/service/scheduler.md");
  });
});

describe("scheduler · retire is the only terminal transition", () => {
  it("retires a task in review", () => {
    const result = retire(sequence(["good", "good"], 3));
    expect(result.illegal).toBe(false);
    expect(result.task.state).toBe("retired");
  });

  it("keeps the review log after retiring, for export", () => {
    const task = sequence(["good", "good"], 3);
    expect(retire(task).task.reviews).toEqual(task.reviews);
  });

  it("cannot be left again", () => {
    const retired = retire(sequence(["good", "good"], 3)).task;
    expect(retire(retired).illegal).toBe(true);
    expect(applyReview(retired, "good", T0 + 99 * DAY, DEFAULT_CONFIG).illegal).toBe(true);
  });

  it("refuses to retire a task that has never been reviewed", () => {
    expect(retire(newTask("t1", "w")).illegal).toBe(true);
  });
});

describe("scheduler · AC-11 no task holds two states or loses its due date", () => {
  it("always has exactly one known state", () => {
    const grades: Grade[] = ["good", "again", "hard", "good", "easy"];
    let task = newTask("t1", "w");
    let at = T0;

    for (const grade of grades) {
      task = applyReview(task, grade, at, DEFAULT_CONFIG).task;
      expect(["new", "learning", "review", "relearning", "suspended", "retired"]).toContain(
        task.state,
      );
      expect(Number.isFinite(task.due)).toBe(true);
      at = task.due;
    }
  });

  it("keeps stability positive once reviewed", () => {
    const task = sequence(["good", "again", "good"], 2);
    expect(task.stability).toBeGreaterThan(0);
  });
});
