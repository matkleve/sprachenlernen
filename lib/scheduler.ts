/**
 * The memory model. Contract: docs/specs/service/scheduler.md
 * Formulas and weights: docs/specs/service/scheduler.algorithm.md
 *
 * FSRS-4.5. Framework-free and clock-free by contract — `now` is always a
 * parameter. A scheduler that calls Date.now() internally cannot be tested for
 * AC-8 (projection equals outcome) or AC-9 (rebuild equals replay), and those
 * two are the whole reason this module is separable from storage and UI.
 */

export const GRADES = ["again", "hard", "good", "easy"] as const;
export type Grade = (typeof GRADES)[number];

/** FSRS numbers grades 1..4. Kept internal — the domain speaks in names. */
const RATING: Record<Grade, 1 | 2 | 3 | 4> = { again: 1, hard: 2, good: 3, easy: 4 };

/**
 * S₀(G) = w_{G−1}. Written as an explicit literal-typed map rather than
 * `w[RATING[g] - 1]`: the arithmetic widens to `number`, which under
 * `noUncheckedIndexedAccess` makes every weight `number | undefined` and
 * invites a non-null assertion to paper over it.
 */
const INITIAL_STABILITY_INDEX: Record<Grade, 0 | 1 | 2 | 3> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

/**
 * Exactly 17. A tuple, not `number[]` — the count is part of the contract, and
 * a fixed length is what lets each `w[n]` below be a `number` rather than a
 * maybe-undefined that has to be asserted away.
 */
export type Weights = readonly [
  number, number, number, number, number, number, number, number, number,
  number, number, number, number, number, number, number, number,
];

export type TaskState = "new" | "learning" | "review" | "relearning" | "suspended" | "retired";

export type Review = {
  at: number;
  grade: Grade;
};

export type Task = {
  id: string;
  wordId: string;
  state: TaskState;
  /** Days until recall decays to target retention. Undefined until first review. */
  stability?: number;
  difficulty: number;
  due: number;
  /** When the last review happened. Undefined until first review. */
  lastReviewAt?: number;
  /** Consecutive `again` answers. Reset by any success. Drives suspension. */
  lapses: number;
  /** Append-only. The source of truth — everything above is derived from it. */
  reviews: Review[];
};

export type Config = {
  targetRetention: number;
  /** Consecutive lapses at which a task suspends itself (UC-013). */
  lapseThreshold: number;
  /** Stability in days at which a learning task graduates to review. */
  graduationStability: number;
  weights: Weights;
  /**
   * Bumped whenever `weights` change. Recorded next to the reviews that used it,
   * because changing weights changes every future interval — a calibration
   * event under studie/03-level-modell.md rule 4.
   */
  weightsVersion: string;
};

/**
 * FSRS-4.5 defaults, 17 weights.
 * Source: github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
 *
 * These are the published population defaults, not per-user optimised values.
 * They already predict recall better than SM-2 for practically every user, so
 * optimisation is deliberately out of scope (see the spec's Open section).
 */
export const FSRS_45_WEIGHTS: Weights = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072,
  0.0793, 0.3246, 1.587, 0.2272, 2.8755,
];

export const DEFAULT_CONFIG: Config = {
  targetRetention: 0.9,
  lapseThreshold: 4,
  graduationStability: 1,
  weights: FSRS_45_WEIGHTS,
  weightsVersion: "fsrs-4.5-default",
};

const DAY = 86_400_000;
const DECAY = -0.5;
const FACTOR = 19 / 81;

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

const clampDifficulty = (d: number) => Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, d));

/**
 * Legal transitions. Anything absent is illegal and becomes a reported no-op —
 * never a throw, because a scheduler that throws mid-session loses the session.
 * Self-transitions are handled in `canTransition`, not listed here.
 */
const TRANSITIONS: Record<TaskState, readonly TaskState[]> = {
  new: ["learning"],
  learning: ["review", "suspended"],
  review: ["relearning", "suspended", "retired"],
  relearning: ["review", "suspended"],
  suspended: ["learning", "retired"],
  retired: [],
};

/**
 * Terminal = no outgoing edges. Derived from the map rather than kept as a
 * second list, so the two cannot drift apart.
 */
const isTerminal = (state: TaskState) => TRANSITIONS[state].length === 0;

/**
 * A move to the same state is not a transition and is normally allowed — but
 * NOT from a terminal state. Acting on a terminal state is a no-op by
 * definition (docs/STATE.md), and treating `retired → retired` as a legal
 * self-transition made retiring an already-retired task report success.
 */
const canTransition = (from: TaskState, to: TaskState) =>
  !isTerminal(from) && (from === to || TRANSITIONS[from].includes(to));

// --- the curve ---------------------------------------------------------------

/** R(t, S) — probability of recall after t days at stability S. */
const recallProbability = (elapsedDays: number, stability: number) =>
  Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);

/** I(r, S) — days until recall probability falls to r. */
const intervalDays = (targetRetention: number, stability: number) =>
  (stability / FACTOR) * (Math.pow(targetRetention, 1 / DECAY) - 1);

/**
 * Retrievability right now. Derived, never stored — which is what lets the
 * review log be the single source of truth (AC-9).
 */
export const retrievability = (task: Task, now: number): number => {
  if (task.stability === undefined || task.lastReviewAt === undefined) return 0;
  const elapsedDays = Math.max(0, (now - task.lastReviewAt) / DAY);
  return recallProbability(elapsedDays, task.stability);
};

// --- the model ---------------------------------------------------------------

const initialStability = (grade: Grade, w: Weights) => w[INITIAL_STABILITY_INDEX[grade]];

/** D₀(G) = w₄ − (G−3)·w₅ — linear in FSRS-4.5. */
const initialDifficulty = (grade: Grade, w: Weights) =>
  clampDifficulty(w[4] - (RATING[grade] - 3) * w[5]);

/** D' = w₇·D₀(3) + (1−w₇)·(D − w₆·(G−3)) — mean reversion toward D₀(good). */
const nextDifficulty = (difficulty: number, grade: Grade, w: Weights) =>
  clampDifficulty(w[7] * w[4] + (1 - w[7]) * (difficulty - w[6] * (RATING[grade] - 3)));

const stabilityAfterRecall = (
  stability: number,
  difficulty: number,
  r: number,
  grade: Grade,
  w: Weights,
) => {
  const hard = grade === "hard" ? w[15] : 1;
  const easy = grade === "easy" ? w[16] : 1;
  const growth =
    Math.exp(w[8]) *
    (11 - difficulty) *
    Math.pow(stability, -w[9]) *
    (Math.exp(w[10] * (1 - r)) - 1) *
    hard *
    easy;
  return stability * (growth + 1);
};

const stabilityAfterLapse = (
  stability: number,
  difficulty: number,
  r: number,
  w: Weights,
) => {
  const next =
    w[11] *
    Math.pow(difficulty, -w[12]) *
    (Math.pow(stability + 1, w[13]) - 1) *
    Math.exp(w[14] * (1 - r));
  // Never above the stability it already had: a lapse cannot be an improvement.
  return Math.min(next, stability);
};

// --- stepping ----------------------------------------------------------------

type Step = { stability: number; difficulty: number; state: TaskState; lapses: number };

/**
 * The single place a grade turns into a new memory state. `applyReview` and
 * `project` both go through here, which is what makes AC-8 exact by
 * construction rather than by matching two similar code paths.
 */
const step = (task: Task, grade: Grade, now: number, config: Config): Step => {
  const w = config.weights;
  const first = task.stability === undefined;

  if (first) {
    // A first review always enters `learning`, never `review` directly, even
    // when initial stability already exceeds the graduation threshold — the
    // transition map has no new → review edge, and graduating on the very first
    // answer would mean one lucky guess buys a multi-day interval.
    return {
      stability: initialStability(grade, w),
      difficulty: initialDifficulty(grade, w),
      state: "learning",
      lapses: grade === "again" ? 1 : 0,
    };
  }

  // Narrowed once, here: `first` above is exactly `stability === undefined`,
  // but the compiler cannot carry that across the early return. A local beats
  // two non-null assertions, which would survive a later refactor that made
  // them wrong.
  const stability = task.stability ?? initialStability(grade, w);
  const r = retrievability(task, now);
  const difficulty = nextDifficulty(task.difficulty, grade, w);

  if (grade === "again") {
    const lapses = task.lapses + 1;
    return {
      stability: stabilityAfterLapse(stability, task.difficulty, r, w),
      difficulty,
      state: lapses >= config.lapseThreshold ? "suspended" : "relearning",
      lapses,
    };
  }

  const nextStability = stabilityAfterRecall(stability, task.difficulty, r, grade, w);
  return {
    stability: nextStability,
    difficulty,
    state: nextStability >= config.graduationStability ? "review" : "learning",
    lapses: 0,
  };
};

/**
 * Interval in whole days. Rounded exactly once, here — rounding an intermediate
 * value too would make the outcome drift from the projection the learner was
 * shown, which reads to them as a lie (AC-8).
 */
const dueFrom = (now: number, stability: number, config: Config) =>
  now + Math.max(1, Math.round(intervalDays(config.targetRetention, stability))) * DAY;

// --- public API --------------------------------------------------------------

export const newTask = (id: string, wordId: string): Task => ({
  id,
  wordId,
  state: "new",
  difficulty: DEFAULT_CONFIG.weights[4],
  due: 0,
  lapses: 0,
  reviews: [],
});

export type ApplyResult = {
  task: Task;
  illegal: boolean;
  reason?: string;
};

export const applyReview = (
  task: Task,
  grade: Grade,
  now: number,
  config: Config = DEFAULT_CONFIG,
): ApplyResult => {
  if (task.state === "suspended") {
    return {
      task,
      illegal: true,
      reason: `task is suspended: grade "${grade}" ignored until it is repaired or unsuspended`,
    };
  }
  if (task.state === "retired") {
    return { task, illegal: true, reason: `task is retired: grade "${grade}" ignored` };
  }

  const next = step(task, grade, now, config);

  if (!canTransition(task.state, next.state)) {
    return {
      task,
      illegal: true,
      reason: `illegal transition ${task.state} → ${next.state}`,
    };
  }

  return {
    task: {
      ...task,
      state: next.state,
      stability: next.stability,
      difficulty: next.difficulty,
      lapses: next.lapses,
      lastReviewAt: now,
      // A suspended task keeps its last due date. It is excluded from sessions
      // by STATE, not by date — one source of truth for "is this scheduled".
      due: next.state === "suspended" ? task.due : dueFrom(now, next.stability, config),
      reviews: [...task.reviews, { at: now, grade }],
    },
    illegal: false,
  };
};

export type Projection = { due: number; intervalDays: number; stability: number };

/**
 * What each grade would do, without committing any of it. Shown to the learner
 * before they answer (UC-005), so it must not mutate.
 */
export const project = (
  task: Task,
  now: number,
  config: Config = DEFAULT_CONFIG,
): Record<Grade, Projection> =>
  Object.fromEntries(
    GRADES.map((grade) => {
      const next = step(task, grade, now, config);
      const due = next.state === "suspended" ? task.due : dueFrom(now, next.stability, config);
      return [grade, { due, intervalDays: (due - now) / DAY, stability: next.stability }];
    }),
  ) as Record<Grade, Projection>;

/**
 * Rebuild the whole state from the log. Equal to replaying the reviews one at a
 * time (AC-9) — which is what makes a weights change a recomputation rather
 * than a migration.
 */
export const rebuild = (
  id: string,
  wordId: string,
  reviews: readonly Review[],
  config: Config = DEFAULT_CONFIG,
): Task =>
  reviews.reduce(
    (task, review) => applyReview(task, review.grade, review.at, config).task,
    newTask(id, wordId),
  );

/** The only terminal transition: the learner removed the word from their set. */
export const retire = (task: Task): ApplyResult =>
  canTransition(task.state, "retired")
    ? { task: { ...task, state: "retired" }, illegal: false }
    : { task, illegal: true, reason: `illegal transition ${task.state} → retired` };
