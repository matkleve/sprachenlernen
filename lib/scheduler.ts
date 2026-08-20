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
  /**
   * Stability in days at which a task counts as held stably for vocabulary
   * counts and form-recall staging — separate from graduation (see
   * vocabulary-snapshot.md, calibration 2026-08-12).
   */
  heldStabilityThreshold: number;
  /** Atlas display tier: held tasks at or above this stability are mature. */
  matureStabilityThreshold: number;
  /**
   * How far actual retrievability at the due date may drift from
   * `targetRetention`. Whole-day rounding is applied only while it stays inside
   * this budget — see `dueFrom`.
   */
  retentionTolerance: number;
  weights: Weights;
  /**
   * Bumped whenever `weights` change. Recorded next to the reviews that used it,
   * because changing weights changes every future interval — a calibration
   * event under study/STUDY-003-level-model.md rule 4.
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
  heldStabilityThreshold: 7,
  matureStabilityThreshold: 21,
  retentionTolerance: 0.02,
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
  // Clamped on BOTH sides. Above: a lapse cannot be an improvement. Below: never
  // under the initial stability for `again` — otherwise repeated lapses drive S
  // toward zero, and `recallProbability` divides by it.
  return Math.max(w[INITIAL_STABILITY_INDEX.again], Math.min(next, stability));
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
      // The POST-update difficulty feeds stability. The algorithm spec says the
      // order matters; passing the pre-update value made steps 1 and 2
      // order-independent and silently mis-scheduled every future review.
      stability: stabilityAfterLapse(stability, difficulty, r, w),
      difficulty,
      // A failure does not move a task across the machine. `relearning` means
      // "lapsed from review"; a task still in `learning` that fails stays in
      // `learning`. Deriving the target from stability alone produced states the
      // transition map forbids, and the resulting illegal move discarded the
      // learner's answer entirely.
      state:
        lapses >= config.lapseThreshold
          ? "suspended"
          : task.state === "review"
            ? "relearning"
            : task.state,
      lapses,
    };
  }

  const nextStability = stabilityAfterRecall(stability, difficulty, r, grade, w);
  return {
    stability: nextStability,
    difficulty,
    // Graduation only ever moves forward. A success can promote `learning` or
    // `relearning` to `review`; it can never demote a task already in `review`.
    state:
      task.state === "review" || nextStability >= config.graduationStability
        ? "review"
        : task.state,
    lapses: 0,
  };
};

/**
 * Rounded exactly once, here — rounding an intermediate value too would make the
 * outcome drift from the projection the learner was shown, which reads to them
 * as a lie (AC-8).
 *
 * Whole days are a presentation choice: learners think in days, not hours. But
 * they are only affordable when the interval is long enough that half a day is
 * noise. At a stability near one day, rounding moved actual retrievability by
 * more than the spec's whole tolerance.
 *
 * So the rule is stated in terms of the thing that matters rather than as a
 * threshold someone would later tune: **round only while rounding keeps
 * retrievability inside the tolerance budget.** Short intervals therefore keep
 * sub-day precision, long ones land on whole days, and AC-4 holds by
 * construction instead of by luck.
 */
const dueFrom = (now: number, stability: number, state: TaskState, config: Config) => {
  const exact = intervalDays(config.targetRetention, stability);
  if (state !== "review") return now + exact * DAY;

  const rounded = Math.max(1, Math.round(exact));
  const drift = Math.abs(
    recallProbability(rounded, stability) - config.targetRetention,
  );
  return now + (drift <= config.retentionTolerance ? rounded : exact) * DAY;
};

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
      due: next.state === "suspended" ? task.due : dueFrom(now, next.stability, next.state, config),
      reviews: [...task.reviews, { at: now, grade }],
    },
    illegal: false,
  };
};

export type Projection = { due: number; intervalDays: number; stability: number };

/**
 * What each grade would do, without committing any of it. Shown to the learner
 * before they answer (UC-005), so it must not mutate — and it must honour the
 * same guards as `applyReview`. Projecting freely while applying refuses is how
 * the learner gets promised an interval that answering then does not deliver.
 */
export const project = (
  task: Task,
  now: number,
  config: Config = DEFAULT_CONFIG,
): Record<Grade, Projection> =>
  Object.fromEntries(
    GRADES.map((grade) => {
      const outcome = applyReview(task, grade, now, config);
      const due = outcome.illegal ? task.due : outcome.task.due;
      return [
        grade,
        {
          due,
          intervalDays: outcome.illegal ? 0 : (due - now) / DAY,
          stability: outcome.illegal ? (task.stability ?? 0) : (outcome.task.stability ?? 0),
        },
      ];
    }),
  ) as Record<Grade, Projection>;

export type RebuildResult = {
  task: Task;
  /**
   * Reviews the machine refused. Should always be empty: the log is the source
   * of truth, so a rejected entry means the log and the model disagree. Returned
   * rather than dropped — silently discarding a learner's answer is how a
   * persisted log and the task derived from it end up with different histories.
   */
  rejected: Review[];
};

/**
 * Rebuild the whole state from the log — which is what makes a weights change a
 * recomputation rather than a migration.
 */
export const rebuild = (
  id: string,
  wordId: string,
  reviews: readonly Review[],
  config: Config = DEFAULT_CONFIG,
): RebuildResult => {
  let task = newTask(id, wordId);
  const rejected: Review[] = [];

  for (const review of reviews) {
    const outcome = applyReview(task, review.grade, review.at, config);
    if (outcome.illegal) rejected.push(review);
    else task = outcome.task;
  }

  return { task, rejected };
};

/** The learner parks a task themselves. Distinct from lapse-driven suspension. */
export const suspend = (task: Task): ApplyResult =>
  canTransition(task.state, "suspended")
    ? { task: { ...task, state: "suspended" }, illegal: false }
    : { task, illegal: true, reason: `illegal transition ${task.state} → suspended` };

/**
 * Back from suspension — as `learning`, never straight to `review`: whatever
 * made it fail has not been re-verified. Without this the map declared
 * suspended → learning legal while no exported function could reach it, making
 * `suspended` a second terminal state.
 */
export const unsuspend = (task: Task): ApplyResult =>
  canTransition(task.state, "learning")
    ? { task: { ...task, state: "learning", lapses: 0 }, illegal: false }
    : { task, illegal: true, reason: `illegal transition ${task.state} → learning` };

/** The only terminal transition: the learner removed the word from their set. */
export const retire = (task: Task): ApplyResult =>
  canTransition(task.state, "retired")
    ? { task: { ...task, state: "retired" }, illegal: false }
    : { task, illegal: true, reason: `illegal transition ${task.state} → retired` };
