import { formExerciseFixtures } from "@/lib/form-exercise-fixtures";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

const DEFAULT_LANG = "es";

export function composeClozeSentencesRecipe(ctx: SessionContext): ExerciseRecipe {
  const fixtures = formExerciseFixtures(DEFAULT_LANG);
  const loop: ExerciseStep[] = [];

  fixtures.cloze.forEach((item, index) => {
    loop.push(
      {
        id: `cloze-${index + 1}-do`,
        type: "do",
        component: "cloze-type",
        label: `Sentence ${index + 1}`,
        config: { before: item.before, after: item.after },
      },
      {
        id: `cloze-${index + 1}-review`,
        type: "review",
        component: "reveal-answer",
        label: "Answer",
        config: { answer: item.answer },
      },
    );
  });

  return {
    methodId: "cloze-sentences",
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: { items: ["Keyboard", "Recall the missing form"] },
      },
      ...loop,
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Practise these forms again"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export function resolveClozeSentencesRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeClozeSentencesRecipe(ctx);
}
