import { describe, expect, it } from "vitest";

import {
  GRADES,
  applyReview,
  DEFAULT_CONFIG,
  newTask,
  project,
  rebuild,
  retire,
  suspend,
  unsuspend,
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
  const lapsedToSuspension = () => {
    const lapses = Array.from<unknown, Grade>(
      { length: DEFAULT_CONFIG.lapseThreshold + 1 },
      () => "again",
    );
    return sequence(["good", "good", ...lapses], 3);
  };

  it("reaches suspended", () => {
    expect(lapsedToSuspension().state).toBe("suspended");
  });

  it("leaves state and due untouched", () => {
    const task = lapsedToSuspension();
    const result = applyReview(task, "good", T0 + 99 * DAY, DEFAULT_CONFIG);
    expect(result.task).toEqual(task);
  });

  it("reports the transition as illegal instead of throwing", () => {
    const result = applyReview(lapsedToSuspension(), "good", T0 + 99 * DAY, DEFAULT_CONFIG);
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

    expect(rebuild("t1", "w", reviews, DEFAULT_CONFIG).task).toEqual(stepwise);
  });

  it("is stable when rebuilt twice", () => {
    const reviews: Review[] = [
      { at: T0, grade: "good" },
      { at: T0 + 4 * DAY, grade: "again" },
      { at: T0 + 5 * DAY, grade: "good" },
    ];
    expect(rebuild("t1", "w", reviews, DEFAULT_CONFIG).task).toEqual(
      rebuild("t1", "w", reviews, DEFAULT_CONFIG).task,
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

// ---------------------------------------------------------------------------
// Regressions from the adversarial review of 2026-08-08. Each of these failed
// against the reviewed implementation while all 29 tests above passed — which
// is the point: they are written to be capable of failing.
// ---------------------------------------------------------------------------

describe("scheduler · R1 no answer is ever discarded", () => {
  it("records a lapse on a task still in learning", () => {
    const learning = sequence(["good"]);
    expect(learning.state).toBe("learning");

    const outcome = applyReview(learning, "again", T0 + DAY, DEFAULT_CONFIG);
    expect(outcome.illegal).toBe(false);
    expect(outcome.task.reviews).toHaveLength(2);
    expect(outcome.task.lapses).toBe(1);
    expect(outcome.task.lastReviewAt).toBe(T0 + DAY);
  });

  it("keeps a failing learning task in learning, not relearning", () => {
    const outcome = applyReview(sequence(["good"]), "again", T0 + DAY, DEFAULT_CONFIG);
    expect(outcome.task.state).toBe("learning");
  });

  it("never drops a review across every grade sequence up to depth 5", () => {
    const walk = (task: Task, at: number, depth: number, applied: number) => {
      if (depth === 0) return;
      for (const grade of GRADES) {
        const outcome = applyReview(task, grade, at, DEFAULT_CONFIG);
        if (task.state === "suspended" || task.state === "retired") {
          expect(outcome.illegal).toBe(true);
          continue;
        }
        expect({ grade, from: task.state, illegal: outcome.illegal }).toEqual({
          grade,
          from: task.state,
          illegal: false,
        });
        expect(outcome.task.reviews).toHaveLength(applied + 1);
        walk(outcome.task, Math.max(outcome.task.due, at + DAY), depth - 1, applied + 1);
      }
    };
    walk(newTask("t1", "w"), T0, 5, 0);
  });
});

describe("scheduler · R2 the projection cannot promise what answering will not deliver", () => {
  it.each(GRADES)("agrees with answering from state learning · %s", (grade) => {
    const learning = sequence(["good"]);
    const at = T0 + DAY;
    expect(project(learning, at, DEFAULT_CONFIG)[grade].due).toBe(
      applyReview(learning, grade, at, DEFAULT_CONFIG).task.due,
    );
  });

  it("never offers a negative interval for a suspended task", () => {
    const lapses = Array.from<unknown, Grade>(
      { length: DEFAULT_CONFIG.lapseThreshold + 1 },
      () => "again",
    );
    const suspended = sequence(["good", "good", ...lapses], 3);
    const projected = project(suspended, T0 + 99 * DAY, DEFAULT_CONFIG);

    for (const grade of GRADES) {
      expect(projected[grade].intervalDays).toBeGreaterThanOrEqual(0);
      expect(projected[grade].due).toBe(suspended.due);
    }
  });
});

describe("scheduler · R3 rebuild accounts for the whole log", () => {
  it("keeps every review of a legal log", () => {
    const grades: Grade[] = ["good", "again", "good", "again", "hard", "good"];
    const reviews: Review[] = grades.map((grade, i) => ({ at: T0 + i * DAY, grade }));
    const { task, rejected } = rebuild("t1", "w", reviews, DEFAULT_CONFIG);

    expect(rejected).toEqual([]);
    expect(task.reviews).toHaveLength(grades.length);
  });

  it("reports a review it could not apply rather than dropping it", () => {
    const lapses = Array.from<unknown, Grade>(
      { length: DEFAULT_CONFIG.lapseThreshold },
      () => "again",
    );
    const grades: Grade[] = ["good", ...lapses, "good"];
    const reviews: Review[] = grades.map((grade, i) => ({ at: T0 + i * DAY, grade }));
    const { task, rejected } = rebuild("t1", "w", reviews, DEFAULT_CONFIG);

    expect(task.state).toBe("suspended");
    expect(rejected).toHaveLength(1);
    expect(task.reviews.length + rejected.length).toBe(grades.length);
  });
});

describe("scheduler · R4 the post-update difficulty feeds stability", () => {
  it("uses the harder difficulty a lapse just produced", () => {
    const mature = sequence(["good", "good", "good"], 4);
    const at = T0 + 20 * DAY;
    const after = applyReview(mature, "again", at, DEFAULT_CONFIG).task;

    // A lapse raises difficulty, and higher difficulty means lower post-lapse
    // stability. Feeding the pre-update difficulty would produce a strictly
    // larger value; this asserts the documented ordering actually happens.
    expect(after.difficulty).toBeGreaterThan(mature.difficulty);
    expect(after.stability!).toBeLessThan(mature.stability!);
  });

  it("gives easy a larger stability than good, via its lower difficulty", () => {
    const mature = sequence(["good", "good", "good"], 4);
    const at = T0 + 20 * DAY;
    const easy = applyReview(mature, "easy", at, DEFAULT_CONFIG).task;
    const good = applyReview(mature, "good", at, DEFAULT_CONFIG).task;

    expect(easy.difficulty).toBeLessThan(good.difficulty);
    expect(easy.stability!).toBeGreaterThan(good.stability!);
  });
});

describe("scheduler · R5 AC-4 holds in every state, not just review", () => {
  const walk = (task: Task, at: number, depth: number, seen: Set<string>) => {
    if (depth === 0) return;
    for (const grade of GRADES) {
      const outcome = applyReview(task, grade, at, DEFAULT_CONFIG);
      if (outcome.illegal) continue;
      const next = outcome.task;
      if (next.state !== "suspended") {
        const error = Math.abs(retrievability(next, next.due) - DEFAULT_CONFIG.targetRetention);
        seen.add(next.state);
        expect({ state: next.state, within: error < 0.02 }).toEqual({
          state: next.state,
          within: true,
        });
      }
      walk(next, next.due, depth - 1, seen);
    }
  };

  it("stays within tolerance for learning, relearning and review", () => {
    const seen = new Set<string>();
    walk(newTask("t1", "w"), T0, 5, seen);
    expect([...seen].sort()).toEqual(["learning", "relearning", "review"]);
  });
});

describe("scheduler · R6 post-lapse stability has a floor", () => {
  it("never falls below the initial stability for again", () => {
    let task = sequence(["good", "good", "good"], 4);
    let at = T0 + 20 * DAY;

    for (let i = 0; i < 3; i++) {
      const outcome = applyReview(task, "again", at, DEFAULT_CONFIG);
      if (outcome.illegal) break;
      task = outcome.task;
      expect(task.stability!).toBeGreaterThanOrEqual(DEFAULT_CONFIG.weights[0]);
      at += 60_000;
    }
  });
});

describe("scheduler · R7 re-answering at the same instant teaches nothing", () => {
  // Not a defect: at zero elapsed time recall probability is 1, so the growth
  // term is zero. That IS the spacing effect. Recorded as a property so nobody
  // later "fixes" it into rewarding immediate repetition.
  it("does not grow stability when no time has passed", () => {
    const task = sequence(["good", "good"], 3);
    const again = applyReview(task, "good", task.lastReviewAt!, DEFAULT_CONFIG).task;
    expect(again.stability!).toBeCloseTo(task.stability!, 10);
  });
});

describe("scheduler · R8/R9 suspension is reversible and excluded by state", () => {
  it("suspends on request and keeps the log", () => {
    const task = sequence(["good", "good"], 3);
    const outcome = suspend(task);
    expect(outcome.illegal).toBe(false);
    expect(outcome.task.state).toBe("suspended");
    expect(outcome.task.reviews).toEqual(task.reviews);
  });

  it("returns as learning, never straight back to review", () => {
    const suspended = suspend(sequence(["good", "good"], 3)).task;
    const revived = unsuspend(suspended);
    expect(revived.illegal).toBe(false);
    expect(revived.task.state).toBe("learning");
    expect(revived.task.lapses).toBe(0);
  });

  it("accepts grades again once unsuspended", () => {
    const revived = unsuspend(suspend(sequence(["good", "good"], 3)).task).task;
    expect(applyReview(revived, "good", T0 + 40 * DAY, DEFAULT_CONFIG).illegal).toBe(false);
  });

  it("keeps its due date, and is excluded by state rather than by date", () => {
    const suspended = suspend(sequence(["good", "good"], 3)).task;
    expect(Number.isFinite(suspended.due)).toBe(true);
    expect(applyReview(suspended, "good", suspended.due, DEFAULT_CONFIG).illegal).toBe(true);
  });
});
