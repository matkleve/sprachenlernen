/**
 * Contract: docs/specs/feature/exercise-runner.states.md
 */
import { describe, expect, it } from "vitest";

import {
  answerForStep,
  canCompleteStep,
  completeStep,
  createRunnerState,
  navigateRelative,
  setStepCheck,
  setStepText,
} from "@/lib/exercise-runner/runner-state";
import type { ExerciseRecipe, ExerciseRunnerState } from "@/lib/exercise-runner/types";

const multiWordRecipe: ExerciseRecipe = {
  methodId: "build-a-sentence",
  steps: [
    {
      id: "write-1",
      type: "do",
      component: "sentence-check",
      config: { word: "casa", gloss: "Haus", lemma: "casa" },
    },
    {
      id: "write-2",
      type: "do",
      component: "sentence-check",
      config: { word: "perro", gloss: "Hund", lemma: "perro" },
    },
    {
      id: "decide-1",
      type: "decide",
      component: "summary",
      config: {},
    },
  ],
};

/** A returned check with nothing found — what pressing Prüfen leaves behind. */
function checked(state: ExerciseRunnerState, stepId: string): ExerciseRunnerState {
  return setStepCheck(state, stepId, {
    phase: "checked",
    result: { status: "checked", text: "", tokens: [], findings: [] },
  });
}

describe("sentence-check completion gate", () => {
  it("does not complete a step whose sentence was never checked", () => {
    let state = createRunnerState(multiWordRecipe);
    state = setStepText(state, "write-1", "Mi casa es grande.");

    expect(canCompleteStep(state)).toBe(false);
    expect(completeStep(state).activeStepIndex).toBe(0);
  });

  it("completes once a check has returned", () => {
    let state = createRunnerState(multiWordRecipe);
    state = setStepText(state, "write-1", "Mi casa es grande.");
    state = checked(state, "write-1");

    expect(canCompleteStep(state)).toBe(true);
    expect(completeStep(state).activeStepIndex).toBe(1);
  });

  it("returns to writing when the learner edits after a check", () => {
    let state = createRunnerState(multiWordRecipe);
    state = setStepText(state, "write-1", "Mi casa es grande.");
    state = checked(state, "write-1");
    state = setStepText(state, "write-1", "Mi casa es muy grande.");

    // The findings on screen described text that no longer exists.
    expect(answerForStep(state, "write-1").check).toEqual({ phase: "writing" });
    expect(canCompleteStep(state)).toBe(false);
  });
});

describe("per-step answers", () => {
  it("keeps each step's text under its own id", () => {
    let state = createRunnerState(multiWordRecipe);
    state = setStepText(state, "write-1", "Mi casa es grande.");
    state = checked(state, "write-1");
    state = completeStep(state);
    state = setStepText(state, "write-2", "Mi perro es pequeño.");

    expect(answerForStep(state, "write-1").text).toBe("Mi casa es grande.");
    expect(answerForStep(state, "write-2").text).toBe("Mi perro es pequeño.");
  });

  it("still shows the first sentence after navigating back to it", () => {
    let state = createRunnerState(multiWordRecipe);
    state = setStepText(state, "write-1", "Mi casa es grande.");
    state = checked(state, "write-1");
    state = completeStep(state);
    expect(state.activeStepIndex).toBe(1);

    state = navigateRelative(state, -1);

    expect(state.activeStepIndex).toBe(0);
    expect(answerForStep(state, "write-1").text).toBe("Mi casa es grande.");
  });

  it("starts a step that was never written on with an empty answer", () => {
    const state = createRunnerState(multiWordRecipe);
    expect(answerForStep(state, "write-2")).toEqual({
      text: "",
      photoDataUrl: null,
      markedErrorTokens: [],
      check: { phase: "writing" },
    });
  });

  it("does not clear an answer when its step is completed", () => {
    let state = createRunnerState(multiWordRecipe);
    state = setStepText(state, "write-1", "Mi casa es grande.");
    state = checked(state, "write-1");
    state = completeStep(state);

    expect(answerForStep(state, "write-1").text).toBe("Mi casa es grande.");
  });
});
