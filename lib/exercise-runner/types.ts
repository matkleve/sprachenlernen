/** Contract: docs/specs/feature/exercise-runner.md */

import type { SentenceCheckResult } from "@/lib/sentence-check";

export type StepType =
  | "prepare"
  | "do"
  | "wait"
  | "submit"
  | "review"
  | "decide";

export type StepStatus = "unseen" | "seen" | "done" | "skipped";

export type RunnerPhase = "loading" | "active" | "complete" | "abandoned";

export type ExerciseStep = {
  id: string;
  type: StepType;
  component?: string;
  label?: string;
  /** i18n key under `exerciseRunner` — preferred over `label`. */
  labelKey?: string;
  config: Record<string, unknown>;
};

export type ExerciseRecipe = {
  methodId: string;
  sourceId?: string;
  steps: ExerciseStep[];
};

export type TimerState = {
  stepId: string;
  startedAt: number;
  pausedAt: number | null;
  elapsedMs: number;
  durationMs: number;
  expired: boolean;
};

/**
 * One `sentence-check` step's progress through its own check. One enum, not
 * three booleans — `checking` and `unavailable` at once is a state that should
 * not exist (STATE.md §2).
 */
export type StepCheckState =
  | { phase: "writing" }
  | { phase: "checking" }
  | { phase: "checked"; result: SentenceCheckResult };

/**
 * Everything the learner produced on **one** step. Keyed by step id in
 * `stepAnswers`, never shared: a recipe with three `sentence-check` items has
 * three of these, and navigating between them keeps all three.
 *
 * The runner reducer stores this bag and never interprets it. Only the step's
 * own component and its descriptor read the fields — which is why a repeated
 * step no longer needs the reducer to know one Method's component name in order
 * to clear a shared draft between items.
 */
export type StepAnswer = {
  /** Typed text — `capture`, `sentence-check`, `timed-write`. */
  text: string;
  /** Session-local photo — `capture` only. Never persisted. */
  photoDataUrl: string | null;
  /** Tokens the learner tapped as wrong — `self-mark` only. */
  markedErrorTokens: readonly string[];
  /** Last in-step check — `sentence-check` only. */
  check: StepCheckState;
};

export type StepAnswers = Readonly<Record<string, StepAnswer>>;

export const EMPTY_STEP_ANSWER: StepAnswer = {
  text: "",
  photoDataUrl: null,
  markedErrorTokens: [],
  check: { phase: "writing" },
};

export type ExerciseRunnerState = {
  phase: RunnerPhase;
  recipe: ExerciseRecipe;
  activeStepIndex: number;
  stepStatuses: StepStatus[];
  timer: TimerState | null;
  stepAnswers: StepAnswers;
};
