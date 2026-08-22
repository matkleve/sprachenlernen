import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

/** Six step types — for tests and dev until T-E6 recipe loader ships. */
export const FIXTURE_EXERCISE_RECIPE: ExerciseRecipe = {
  methodId: "partial-dictation-fixture",
  sourceId: "fixture:dictation-1",
  steps: [
    {
      id: "prepare-1",
      type: "prepare",
      component: "checklist",
      label: "Get ready",
      config: {
        items: ["Headphones", "Pen and paper"],
      },
    },
    {
      id: "do-1",
      type: "do",
      component: "prompt",
      label: "Listen",
      config: { body: "Hear sentence 1 and write it down." },
    },
    {
      id: "wait-1",
      type: "wait",
      label: "Pause",
      config: { durationSec: 30 },
    },
    {
      id: "submit-1",
      type: "submit",
      component: "capture",
      label: "Your result",
      config: { accept: ["photo", "text"], required: true },
    },
    {
      id: "review-1",
      type: "review",
      component: "self-mark",
      label: "Compare",
      config: { answerKey: "El gato duerme en el sofá." },
    },
    {
      id: "decide-1",
      type: "decide",
      component: "summary",
      label: "Next",
      config: {},
    },
  ],
};
