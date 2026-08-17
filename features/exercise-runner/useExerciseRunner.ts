"use client";

import { useCallback, useEffect, useReducer, useState } from "react";

import {
  abandonRunner,
  canCompleteStep,
  completeStep,
  createRunnerState,
  declineDecide,
  navigateRelative,
  setSubmitPhoto,
  setSubmitText,
  tickTimer,
  toggleMarkedError,
  toggleTimerPause,
  type ExerciseRecipe,
  type ExerciseRunnerState,
} from "@/lib/exercise-runner";

type RunnerAction =
  | { type: "init"; recipe: ExerciseRecipe }
  | { type: "navigate"; delta: -1 | 1; now: number }
  | { type: "complete" }
  | { type: "decline" }
  | { type: "abandon" }
  | { type: "tick"; now: number }
  | { type: "togglePause"; now: number }
  | { type: "setText"; text: string }
  | { type: "setPhoto"; photoDataUrl: string | null }
  | { type: "toggleError"; token: string };

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
      return setSubmitText(state, action.text);
    case "setPhoto":
      return setSubmitPhoto(state, action.photoDataUrl);
    case "toggleError":
      return toggleMarkedError(state, action.token);
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

  const setText = useCallback((text: string) => {
    dispatch({ type: "setText", text });
  }, []);

  const setPhoto = useCallback((photoDataUrl: string | null) => {
    dispatch({ type: "setPhoto", photoDataUrl });
  }, []);

  const toggleError = useCallback((token: string) => {
    dispatch({ type: "toggleError", token });
  }, []);

  return {
    state,
    methodName,
    activeStep,
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
    toggleError,
  };
}
