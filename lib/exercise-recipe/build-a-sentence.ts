import { formExerciseFixtures } from "@/lib/form-exercise-fixtures";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

const DEFAULT_LANG = "es";

export function composeBuildASentenceRecipe(ctx: SessionContext): ExerciseRecipe {
  const fixtures = formExerciseFixtures(DEFAULT_LANG);
  const item = fixtures.buildSentence[0]!;

  return {
    methodId: "build-a-sentence",
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: { items: ["Pen or keyboard", "One target word only"] },
      },
      {
        id: "do-1",
        type: "do",
        component: "type-with-word",
        label: "Write one sentence",
        config: { word: item.word, hint: item.hint },
      },
      {
        id: "review-1",
        type: "review",
        component: "reveal-answer",
        label: "Exemplar",
        config: {
          exemplar: item.exemplar,
          note: "Compare your sentence — no automatic grading.",
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Try another word", "Save this word as a card"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export function resolveBuildASentenceRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeBuildASentenceRecipe(ctx);
}
