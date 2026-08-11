/**
 * The synthetic learner's memory. Contract: docs/SIMULATION.md
 * Boundaries: docs/adr/0008-simulated-learners-as-a-test-harness.md
 *
 * This is the ground truth the app is not allowed to see. The scheduler receives
 * graded answers and nothing else, which is the only reason comparing its
 * estimate against this is informative rather than circular.
 *
 * The decay here is EXPONENTIAL while FSRS uses a power law. That difference is
 * deliberate and load-bearing: sharing the curve would make the scheduler
 * perfect by construction and the calibration assertion meaningless.
 */

import type { Grade } from "@/lib/scheduler";
import type { Rng } from "@/lib/simulation/rng";

const DAY = 86_400_000;

/**
 * Days until true recall falls to {@link RETENTION_ANCHOR} — deliberately the
 * same *unit* FSRS uses for its stability, so the app's estimate and this truth
 * are comparable quantities rather than two different scales sharing a name.
 *
 * Getting this wrong is the first bug this harness produced: with the anchor at
 * 1/e instead, "stability 4" meant 37 % recall at four days to the learner and
 * 90 % to the scheduler, so the app appeared to catastrophically over-schedule a
 * learner no real person resembles. The curve family must differ; the unit must
 * not.
 */
export type TrueMemory = {
  trueStability?: number;
  lastStudiedAt?: number;
};

/** Both curves pass through this point. They diverge either side of it. */
export const RETENTION_ANCHOR = 0.9;

/**
 * Per-learner constants. Not a model of a person — scenario parameters, per
 * ADR-0008 rule 6.
 */
export type Aptitude = {
  /** Multiplier on stability growth after a successful recall. */
  learningRate: number;
  /** Multiplier on how much a lapse costs. Higher = forgets harder. */
  forgettingRate: number;
  /** Stability in days conferred by the very first successful study. */
  initialStability: number;
};

/**
 * Exponential decay anchored at {@link RETENTION_ANCHOR}: at `t = trueStability`
 * this and FSRS agree exactly. Past it the exponential falls faster than FSRS's
 * power law, so the app is expected to grow over-confident at long intervals —
 * that divergence is what the calibration buckets are there to measure, and it is
 * a finding rather than a defect.
 */
export const recallChance = (memory: TrueMemory, now: number): number => {
  if (memory.trueStability === undefined || memory.lastStudiedAt === undefined) return 0;
  const elapsedDays = Math.max(0, (now - memory.lastStudiedAt) / DAY);
  return Math.pow(RETENTION_ANCHOR, elapsedDays / memory.trueStability);
};

/**
 * Did they actually recall it? Drawn from the true curve — never from the app's
 * estimate, which is the whole point of the separation.
 */
export const attemptRecall = (memory: TrueMemory, now: number, rng: Rng): boolean =>
  rng.chance(recallChance(memory, now));

/**
 * What the study did to the true memory.
 *
 * Success grows stability multiplicatively, with diminishing returns at high
 * stability — the qualitative shape every spacing model agrees on, without
 * borrowing FSRS's parameters. Failure shrinks it but never to zero: a floor is
 * required because `recallChance` divides by stability, and because a learner who
 * has once studied a word is not back to never having seen it.
 */
export const afterStudy = (
  memory: TrueMemory,
  recalled: boolean,
  now: number,
  aptitude: Aptitude,
): TrueMemory => {
  const current = memory.trueStability;

  if (current === undefined) {
    return {
      trueStability: recalled ? aptitude.initialStability : aptitude.initialStability / 2,
      lastStudiedAt: now,
    };
  }

  const next = recalled
    ? current * (1 + aptitude.learningRate / (1 + current / 30))
    : Math.max(aptitude.initialStability / 2, current / (1 + aptitude.forgettingRate));

  return { trueStability: next, lastStudiedAt: now };
};

/**
 * The grade the learner reports.
 *
 * Two sources of divergence from truth, both real and both worth simulating: a
 * failure is always reported as `again` (there is nothing to be optimistic
 * about), while a success is graded from how comfortable it felt — and an
 * optimistic learner collapses that judgement onto "good".
 */
export const reportGrade = (
  recalled: boolean,
  confidence: number,
  optimism: number,
  rng: Rng,
): Grade => {
  if (!recalled) return "again";
  if (rng.chance(optimism)) return "good";
  if (confidence > 0.85) return "easy";
  if (confidence > 0.55) return "good";
  return "hard";
};
