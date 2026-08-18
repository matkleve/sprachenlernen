/** Contract: docs/specs/feature/exercise-runner.md */

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

export type SubmitDraft = {
  text: string;
  photoDataUrl: string | null;
};

export type ExerciseRunnerState = {
  phase: RunnerPhase;
  recipe: ExerciseRecipe;
  activeStepIndex: number;
  stepStatuses: StepStatus[];
  timer: TimerState | null;
  submitDraft: SubmitDraft;
  markedErrorTokens: string[];
};
