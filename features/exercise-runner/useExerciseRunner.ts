"use client";

import { useCallback, useEffect, useReducer, useState } from "react";

import {
  abandonRunner,
  activeStepAnswer,
  canCompleteStep,
  completeStep,
  createRunnerState,
  declineDecide,
  navigateRelative,
  setStepCheck,
  setStepPhoto,
  setStepText,
  summariseSessionFindings,
  tickTimer,
  toggleMarkedError,
  toggleTimerPause,
  type ExerciseRecipe,
  type ExerciseRunnerState,
  type SessionFindings,
  type StepAnswer,
  type StepCheckState,
} from "@/lib/exercise-runner";
import { primaryLabelKeyForAnswer } from "@/lib/exercise-step-components";

type RunnerAction =
  | { type: "init"; recipe: ExerciseRecipe }
  | { type: "navigate"; delta: -1 | 1; now: number }
  | { type: "complete" }
  | { type: "decline" }
  | { type: "abandon" }
  | { type: "tick"; now: number }
  | { type: "togglePause"; now: number }
  | { type: "setText"; stepId: string; text: string }
  | { type: "setPhoto"; stepId: string; photoDataUrl: string | null }
  | { type: "setCheck"; stepId: string; check: StepCheckState }
  | { type: "toggleError"; stepId: string; token: string };

function reducer(state: ExerciseRunnerState, action: RunnerAction): ExerciseRunnerState {
  switch (action.type) {
    case "init":
      return createRunnerState(action.recipe);
    case "navigate":
      return navigateRelative(state, action.delta, action.now);
    case "complete":
      return completeStep(state);
    case "decline":
      return declineDecide(state);
    case "abandon":
      return abandonRunner(state);
    case "tick":
      return tickTimer(state, action.now);
    case "togglePause":
      return toggleTimerPause(state, action.now);
    case "setText":
      return setStepText(state, action.stepId, action.text);
    case "setPhoto":
      return setStepPhoto(state, action.stepId, action.photoDataUrl);
    case "setCheck":
      return setStepCheck(state, action.stepId, action.check);
    case "toggleError":
      return toggleMarkedError(state, action.stepId, action.token);
    default:
      return state;
  }
}

export type UseExerciseRunnerOptions = {
  recipe: ExerciseRecipe;
  methodName: string;
};

export type UseExerciseRunnerResult = {
  state: ExerciseRunnerState;
  methodName: string;
  activeStep: ExerciseRunnerState["recipe"]["steps"][number] | null;
  /** The active step's own answer — the only one any surface should read. */
  activeAnswer: StepAnswer;
  /** Component-specific primary label key, or `undefined` for the type default. */
  primaryLabelKey: string | undefined;
  /** What the in-step checks found across the session — for `decide` steps. */
  sessionFindings: SessionFindings;
  canGoBack: boolean;
  canGoForward: boolean;
  canComplete: boolean;
  showStopConfirm: boolean;
  goBack: () => void;
  goForward: () => void;
  completeCurrentStep: () => void;
  decline: () => void;
  requestStop: () => void;
  cancelStop: () => void;
  confirmStop: () => void;
  togglePause: () => void;
  setText: (text: string) => void;
  setPhoto: (photoDataUrl: string | null) => void;
  setCheck: (check: StepCheckState) => void;
  toggleError: (token: string) => void;
};

export function useExerciseRunner({
  recipe,
  methodName,
}: UseExerciseRunnerOptions): UseExerciseRunnerResult {
  const [state, dispatch] = useReducer(
    reducer,
    recipe,
    (r) => createRunnerState(r),
  );
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  useEffect(() => {
    dispatch({ type: "init", recipe });
  }, [recipe]);

  useEffect(() => {
    if (!state.timer || state.timer.pausedAt !== null) return;

    const id = window.setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, 250);

    return () => window.clearInterval(id);
  }, [state.timer?.stepId, state.timer?.pausedAt]);

  const activeStep = state.recipe.steps[state.activeStepIndex] ?? null;

  const goBack = useCallback(() => {
    dispatch({ type: "navigate", delta: -1, now: Date.now() });
  }, []);

  const goForward = useCallback(() => {
    dispatch({ type: "navigate", delta: 1, now: Date.now() });
  }, []);

  const completeCurrentStep = useCallback(() => {
    dispatch({ type: "complete" });
  }, []);

  const decline = useCallback(() => {
    dispatch({ type: "decline" });
  }, []);

  const requestStop = useCallback(() => setShowStopConfirm(true), []);
  const cancelStop = useCallback(() => setShowStopConfirm(false), []);
  const confirmStop = useCallback(() => {
    setShowStopConfirm(false);
    dispatch({ type: "abandon" });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: "togglePause", now: Date.now() });
  }, []);

  // Every write names the step it belongs to. Reading the id off the active
  // step at dispatch time is what stops a late-arriving check result from
  // landing on whichever item the learner has since moved to.
  const activeStepId = activeStep?.id;

  const setText = useCallback(
    (text: string) => {
      if (activeStepId) dispatch({ type: "setText", stepId: activeStepId, text });
    },
    [activeStepId],
  );

  const setPhoto = useCallback(
    (photoDataUrl: string | null) => {
      if (activeStepId) dispatch({ type: "setPhoto", stepId: activeStepId, photoDataUrl });
    },
    [activeStepId],
  );

  const setCheck = useCallback(
    (check: StepCheckState) => {
      if (activeStepId) dispatch({ type: "setCheck", stepId: activeStepId, check });
    },
    [activeStepId],
  );

  const toggleError = useCallback(
    (token: string) => {
      if (activeStepId) dispatch({ type: "toggleError", stepId: activeStepId, token });
    },
    [activeStepId],
  );

  const activeAnswer = activeStepAnswer(state);

  return {
    state,
    methodName,
    activeStep,
    activeAnswer,
    sessionFindings: summariseSessionFindings(state),
    primaryLabelKey: activeStep
      ? primaryLabelKeyForAnswer(activeStep, activeAnswer)
      : undefined,
    canGoBack: state.activeStepIndex > 0,
    canGoForward: state.activeStepIndex < state.recipe.steps.length - 1,
    canComplete: canCompleteStep(state),
    showStopConfirm,
    goBack,
    goForward,
    completeCurrentStep,
    decline,
    requestStop,
    cancelStop,
    confirmStop,
    togglePause,
    setText,
    setPhoto,
    setCheck,
    toggleError,
  };
}
