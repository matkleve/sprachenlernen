/**
 * The runner. Contract: docs/SIMULATION.md
 * Boundaries: docs/adr/0008-simulated-learners-as-a-test-harness.md
 *
 * One synthetic learner, N days, against the real scheduler. The learner's true
 * memory decides what they recall; the scheduler sees only the grade. Nothing
 * here may be used to tune a policy (ADR-0008 rule 4) — it exists to find out how
 * the system behaves, including where it behaves badly.
 */

import {
  DEFAULT_CONFIG,
  applyReview,
  newTask,
  rebuild,
  retrievability,
  type Config,
  type Task,
} from "@/lib/scheduler";
import { afterStudy, attemptRecall, recallChance, reportGrade, type TrueMemory } from "@/lib/simulation/learner";
import type { Persona } from "@/lib/simulation/personas";
import { rngFrom } from "@/lib/simulation/rng";

const DAY = 86_400_000;

/** Predicted-versus-observed, in ten buckets of predicted retrievability. */
export type CalibrationBucket = {
  predicted: number;
  attempts: number;
  recalled: number;
};

export type RunResult = {
  persona: string;
  seed: number;
  days: number;
  tasks: Task[];
  /** True memory per task id. Available to assertions, never to the app. */
  truth: Map<string, TrueMemory>;
  reviews: number;
  /** The scheduler refused an answer. Should never happen in normal operation. */
  illegal: number;
  /** Tasks that were due but the daily budget could not reach. */
  skippedDue: number;
  suspended: number;
  calibration: CalibrationBucket[];
  /** Every state the run actually visited, for reachability assertions. */
  statesSeen: Set<string>;
};

const BUCKETS = 10;

const studiesOn = (day: number, persona: Persona, studyRoll: number) => {
  if (persona.cycle) {
    const period = persona.cycle.onDays + persona.cycle.offDays;
    if (day % period >= persona.cycle.onDays) return false;
  }
  return studyRoll < persona.attendance;
};

export const runLearner = (
  persona: Persona,
  seed: number,
  days: number,
  config: Config = DEFAULT_CONFIG,
): RunResult => {
  const rng = rngFrom(seed);
  const start = Date.UTC(2026, 0, 1);

  const tasks = new Map<string, Task>();
  const truth = new Map<string, TrueMemory>();
  const calibration: CalibrationBucket[] = Array.from({ length: BUCKETS }, (_, i) => ({
    predicted: (i + 0.5) / BUCKETS,
    attempts: 0,
    recalled: 0,
  }));
  const statesSeen = new Set<string>();

  let reviews = 0;
  let illegal = 0;
  let skippedDue = 0;
  let created = 0;

  for (let day = 0; day < days; day++) {
    // Rolled unconditionally so that attendance never shifts the random stream
    // for anything downstream — otherwise two personas differing only in
    // attendance become incomparable, which silently ruins a parameter sweep.
    const studyRoll = rng.next();
    // Mid-day, so a task due "today" is reachable on the day it comes due.
    const now = start + day * DAY + DAY / 2;

    if (!studiesOn(day, persona, studyRoll)) continue;

    const due = [...tasks.values()]
      // Filtered on STATE, not on date — a suspended task keeps a past due date,
      // so `due <= now` alone would keep scheduling it (scheduler spec, "States").
      .filter((t) => (t.state === "new" || t.state === "learning" || t.state === "review" || t.state === "relearning") && t.due <= now)
      .sort((a, b) => a.due - b.due);

    const doNow = due.slice(0, persona.dailyBudget);
    skippedDue += due.length - doNow.length;

    for (const task of doNow) {
      const memory = truth.get(task.id) ?? {};
      const predicted = retrievability(task, now);
      const actual = recallChance(memory, now);
      const recalled = attemptRecall(memory, now, rng);

      // Only meaningful once the scheduler has an estimate at all; a brand-new
      // task predicts 0 by definition and would pile every first exposure into
      // the bottom bucket.
      if (task.stability !== undefined) {
        const bucket = calibration[Math.min(BUCKETS - 1, Math.floor(predicted * BUCKETS))];
        if (bucket) {
          bucket.attempts++;
          if (recalled) bucket.recalled++;
        }
      }

      const grade = reportGrade(recalled, actual, persona.optimism, rng);
      const outcome = applyReview(task, grade, now, config);

      if (outcome.illegal) illegal++;
      else {
        tasks.set(task.id, outcome.task);
        statesSeen.add(outcome.task.state);
      }

      truth.set(task.id, afterStudy(memory, recalled, now, persona.aptitude));
      reviews++;
    }

    const room = Math.max(0, persona.dailyBudget - doNow.length);
    for (let i = 0; i < Math.min(persona.newPerDay, room); i++) {
      const id = `t${created++}`;
      const task = { ...newTask(id, `w${id}`), due: now };
      tasks.set(id, task);
      truth.set(id, {});
      statesSeen.add("new");
    }
  }

  const all = [...tasks.values()];

  return {
    persona: persona.name,
    seed,
    days,
    tasks: all,
    truth,
    reviews,
    illegal,
    skippedDue,
    suspended: all.filter((t) => t.state === "suspended").length,
    calibration,
    statesSeen,
  };
};

/**
 * Does every task's live state equal a rebuild from its own log? This is AC-9 at
 * population scale, against histories messier than any hand-written fixture.
 */
export const rebuildMatches = (result: RunResult, config: Config = DEFAULT_CONFIG): boolean =>
  result.tasks
    // A task with no reviews rebuilds to `newTask` by definition, and this
    // harness hands new tasks a due date of "today" so they are reachable on the
    // day they are created. That due date is the harness's, not the scheduler's,
    // and is not in the log — so comparing it would test the harness against
    // itself rather than testing AC-9.
    .filter((task) => task.reviews.length > 0)
    .every((task) => {
      const { task: rebuilt, rejected } = rebuild(task.id, task.wordId, task.reviews, config);
      if (rejected.length > 0) return false;
      // Suspension by the learner is not in the log, so a rebuild could not know
      // about it. Lapse-driven suspension is, and must reproduce exactly.
      return (
        rebuilt.state === task.state &&
        rebuilt.stability === task.stability &&
        rebuilt.difficulty === task.difficulty &&
        rebuilt.due === task.due
      );
    });

export const observedRecall = (bucket: CalibrationBucket) =>
  bucket.attempts === 0 ? undefined : bucket.recalled / bucket.attempts;
