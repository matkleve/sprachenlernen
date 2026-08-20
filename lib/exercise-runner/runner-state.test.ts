/**
 * Contract: docs/specs/feature/exercise-runner.states.md
 */
import { describe, expect, it } from "vitest";

import { completeStep, createRunnerState } from "@/lib/exercise-runner/runner-state";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

const multiWordRecipe: ExerciseRecipe = {
  methodId: "build-a-sentence",
  steps: [
    {
      id: "write-1",
      type: "do",
      component: "type-with-word",
      config: { word: "casa", gloss: "house" },
    },
    {
      id: "review-1",
      type: "review",
      component: "reveal-answer",
      config: { honestyKey: "revealAnswerDefault" },
    },
    {
      id: "write-2",
      type: "do",
      component: "type-with-word",
      config: { word: "perro", gloss: "dog" },
    },
    {
      id: "review-2",
      type: "review",
      component: "reveal-answer",
      config: { honestyKey: "revealAnswerDefault" },
    },
    {
      id: "decide-1",
      type: "decide",
      component: "offers",
      config: { offers: [] },
    },
  ],
};

describe("completeStep draft reset", () => {
  it("clears submit text when advancing from review to the next type-with-word", () => {
    let state = createRunnerState(multiWordRecipe);
    state = {
      ...state,
      submitDraft: { text: "Mi casa es grande.", photoDataUrl: null },
      activeStepIndex: 1,
      stepStatuses: ["done", "seen", "unseen", "unseen", "unseen"],
    };

    const next = completeStep(state);

    expect(next.activeStepIndex).toBe(2);
    expect(next.submitDraft.text).toBe("");
  });
});
