/**
 * Pure exercise-runner state. Contract: exercise-runner.states.md
 */
import { canCompleteStepAnswer } from "@/lib/exercise-step-components";
import {
  EMPTY_STEP_ANSWER,
  type ExerciseRecipe,
  type ExerciseRunnerState,
  type StepAnswer,
  type StepCheckState,
  type StepStatus,
  type TimerState,
} from "@/lib/exercise-runner/types";

export function createRunnerState(recipe: ExerciseRecipe): ExerciseRunnerState {
  const stepStatuses = recipe.steps.map(() => "unseen" as StepStatus);
  if (stepStatuses.length > 0) stepStatuses[0] = "seen";

  return {
    phase: "active",
    recipe,
    activeStepIndex: 0,
    stepStatuses,
    timer: null,
    stepAnswers: {},
  };
}

/**
 * The answer for one step, or a fresh empty one. Callers never branch on
 * "has this step been written on yet" — an untouched step and a cleared step
 * are the same thing to every reader.
 */
export function answerForStep(state: ExerciseRunnerState, stepId: string): StepAnswer {
  return state.stepAnswers[stepId] ?? EMPTY_STEP_ANSWER;
}

export function activeStepAnswer(state: ExerciseRunnerState): StepAnswer {
  const step = state.recipe.steps[state.activeStepIndex];
  return step ? answerForStep(state, step.id) : EMPTY_STEP_ANSWER;
}

function withAnswer(
  state: ExerciseRunnerState,
  stepId: string,
  patch: Partial<StepAnswer>,
): ExerciseRunnerState {
  return {
    ...state,
    stepAnswers: {
      ...state.stepAnswers,
      [stepId]: { ...answerForStep(state, stepId), ...patch },
    },
  };
}

export function isTerminalPhase(phase: ExerciseRunnerState["phase"]): boolean {
  return phase === "complete" || phase === "abandoned";
}

function clampIndex(state: ExerciseRunnerState, index: number): number {
  return Math.max(0, Math.min(index, state.recipe.steps.length - 1));
}

function withSeenAt(
  statuses: StepStatus[],
  index: number,
): StepStatus[] {
  if (statuses[index] === "unseen") {
    const next = [...statuses];
    next[index] = "seen";
    return next;
  }
  return statuses;
}

function waitDurationMs(step: ExerciseRunnerState["recipe"]["steps"][number]): number {
  const sec = step.config.durationSec;
  return typeof sec === "number" && sec > 0 ? sec * 1000 : 0;
}

function stepUsesTimer(step: ExerciseRunnerState["recipe"]["steps"][number] | undefined): boolean {
  if (!step) return false;
  if (step.type === "wait") return true;
  return step.type === "do" && step.component === "timed-write";
}

function maybeStartWaitTimer(
  state: ExerciseRunnerState,
  stepIndex: number,
  now: number,
): TimerState | null {
  const step = state.recipe.steps[stepIndex];
  if (!step || !stepUsesTimer(step)) return state.timer;

  const durationMs = waitDurationMs(step);
  if (durationMs === 0) return state.timer;

  if (state.timer?.stepId === step.id) return state.timer;

  return {
    stepId: step.id,
    startedAt: now,
    pausedAt: null,
    elapsedMs: 0,
    durationMs,
    expired: false,
  };
}

export function navigateToStep(
  state: ExerciseRunnerState,
  index: number,
  now = Date.now(),
): ExerciseRunnerState {
  if (isTerminalPhase(state.phase)) return state;

  const activeStepIndex = clampIndex(state, index);
  const stepStatuses = withSeenAt(state.stepStatuses, activeStepIndex);

  const next: ExerciseRunnerState = {
    ...state,
    activeStepIndex,
    stepStatuses,
  };

  return {
    ...next,
    timer: maybeStartWaitTimer(next, activeStepIndex, now),
  };
}

export function navigateRelative(
  state: ExerciseRunnerState,
  delta: -1 | 1,
  now = Date.now(),
): ExerciseRunnerState {
  return navigateToStep(state, state.activeStepIndex + delta, now);
}

/**
 * Whether the primary button is live. The rule belongs to the step's component
 * descriptor, not here: chrome that grows a branch per component is how a
 * generic runner ends up knowing which Method it is running.
 */
export function canCompleteStep(state: ExerciseRunnerState): boolean {
  if (isTerminalPhase(state.phase)) return false;

  const step = state.recipe.steps[state.activeStepIndex];
  if (!step) return false;

  return canCompleteStepAnswer(step, answerForStep(state, step.id));
}

export function completeStep(
  state: ExerciseRunnerState,
): ExerciseRunnerState {
  if (!canCompleteStep(state) || isTerminalPhase(state.phase)) return state;

  const step = state.recipe.steps[state.activeStepIndex];
  if (!step) return state;

  const stepStatuses = [...state.stepStatuses];
  stepStatuses[state.activeStepIndex] = "done";

  if (step.type === "decide") {
    return { ...state, stepStatuses, phase: "complete" };
  }

  const isLast = state.activeStepIndex >= state.recipe.steps.length - 1;
  if (isLast) {
    return { ...state, stepStatuses, phase: "complete" };
  }

  // No draft is cleared here. Each step owns its answer, so moving on cannot
  // overwrite the previous item's sentence — that clearing line is what made
  // navigating back show an empty field.
  const nextIndex = state.activeStepIndex + 1;
  const withDone: ExerciseRunnerState = {
    ...state,
    stepStatuses: withSeenAt(stepStatuses, nextIndex),
    activeStepIndex: nextIndex,
  };

  return {
    ...withDone,
    timer: maybeStartWaitTimer(withDone, nextIndex, Date.now()),
  };
}

export function declineDecide(state: ExerciseRunnerState): ExerciseRunnerState {
  if (isTerminalPhase(state.phase)) return state;
  const step = state.recipe.steps[state.activeStepIndex];
  if (step?.type !== "decide") return state;

  const stepStatuses = [...state.stepStatuses];
  stepStatuses[state.activeStepIndex] = "done";

  return { ...state, stepStatuses, phase: "complete" };
}

export function abandonRunner(state: ExerciseRunnerState): ExerciseRunnerState {
  if (isTerminalPhase(state.phase)) return state;
  return { ...state, phase: "abandoned", timer: null };
}

export function tickTimer(
  state: ExerciseRunnerState,
  now: number,
): ExerciseRunnerState {
  if (!state.timer || state.timer.pausedAt !== null) return state;

  const elapsedMs = now - state.timer.startedAt;
  const expired = elapsedMs >= state.timer.durationMs;

  return {
    ...state,
    timer: {
      ...state.timer,
      elapsedMs,
      expired,
    },
  };
}

export function toggleTimerPause(
  state: ExerciseRunnerState,
  now: number,
): ExerciseRunnerState {
  if (!state.timer) return state;

  if (state.timer.pausedAt === null) {
    return {
      ...state,
      timer: {
        ...state.timer,
        pausedAt: now,
        elapsedMs: now - state.timer.startedAt,
      },
    };
  }

  const pausedFor = now - state.timer.pausedAt;
  return {
    ...state,
    timer: {
      ...state.timer,
      startedAt: state.timer.startedAt + pausedFor,
      pausedAt: null,
    },
  };
}

export function setStepText(
  state: ExerciseRunnerState,
  stepId: string,
  text: string,
): ExerciseRunnerState {
  const answer = answerForStep(state, stepId);
  // Editing after a check returns the step to `writing`: the findings on screen
  // describe text that no longer exists, and leaving them up would mark words
  // the learner has already fixed.
  const check: StepCheckState =
    answer.check.phase === "writing" ? answer.check : { phase: "writing" };

  return withAnswer(state, stepId, { text, check });
}

export function setStepPhoto(
  state: ExerciseRunnerState,
  stepId: string,
  photoDataUrl: string | null,
): ExerciseRunnerState {
  return withAnswer(state, stepId, { photoDataUrl });
}

export function setStepCheck(
  state: ExerciseRunnerState,
  stepId: string,
  check: StepCheckState,
): ExerciseRunnerState {
  return withAnswer(state, stepId, { check });
}

export function toggleMarkedError(
  state: ExerciseRunnerState,
  stepId: string,
  token: string,
): ExerciseRunnerState {
  const marked = answerForStep(state, stepId).markedErrorTokens;
  return withAnswer(state, stepId, {
    markedErrorTokens: marked.includes(token)
      ? marked.filter((held) => held !== token)
      : [...marked, token],
  });
}

export function progressLabel(state: ExerciseRunnerState): string {
  const total = state.recipe.steps.length;
  const current = state.activeStepIndex + 1;
  return `${current} / ${total}`;
}
