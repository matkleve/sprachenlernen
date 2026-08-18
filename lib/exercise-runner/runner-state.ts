/**
 * Pure exercise-runner state. Contract: exercise-runner.states.md
 */
import type {
  ExerciseRecipe,
  ExerciseRunnerState,
  StepStatus,
  TimerState,
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
    submitDraft: { text: "", photoDataUrl: null },
    markedErrorTokens: [],
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

export function canCompleteStep(state: ExerciseRunnerState): boolean {
  if (isTerminalPhase(state.phase)) return false;

  const step = state.recipe.steps[state.activeStepIndex];
  if (!step) return false;

  if (step.type === "submit") {
    const accept = step.config.accept;
    const required = step.config.required !== false;
    if (!required) return true;

    const wantsPhoto = Array.isArray(accept) && accept.includes("photo");
    const wantsText = Array.isArray(accept) && accept.includes("text");
    const hasPhoto = Boolean(state.submitDraft.photoDataUrl);
    const hasText = state.submitDraft.text.trim().length > 0;

    if (wantsPhoto && wantsText) return hasPhoto || hasText;
    if (wantsPhoto) return hasPhoto;
    if (wantsText) return hasText;
    return true;
  }

  return true;
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

export function setSubmitText(
  state: ExerciseRunnerState,
  text: string,
): ExerciseRunnerState {
  return {
    ...state,
    submitDraft: { ...state.submitDraft, text },
  };
}

export function setSubmitPhoto(
  state: ExerciseRunnerState,
  photoDataUrl: string | null,
): ExerciseRunnerState {
  return {
    ...state,
    submitDraft: { ...state.submitDraft, photoDataUrl },
  };
}

export function toggleMarkedError(
  state: ExerciseRunnerState,
  token: string,
): ExerciseRunnerState {
  const has = state.markedErrorTokens.includes(token);
  return {
    ...state,
    markedErrorTokens: has
      ? state.markedErrorTokens.filter((t) => t !== token)
      : [...state.markedErrorTokens, token],
  };
}

export function progressLabel(state: ExerciseRunnerState): string {
  const total = state.recipe.steps.length;
  const current = state.activeStepIndex + 1;
  return `${current} / ${total}`;
}
