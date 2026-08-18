import { formExerciseFixtures } from "@/lib/form-exercise-fixtures";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

const DEFAULT_LANG = "es";

export function composeMinimalPairsRecipe(ctx: SessionContext): ExerciseRecipe {
  const fixtures = formExerciseFixtures(DEFAULT_LANG);
  const loop: ExerciseStep[] = [];

  fixtures.minimalPairs.forEach((item, index) => {
    const playedId: "a" | "b" = Math.random() < 0.5 ? "a" : "b";
    loop.push({
      id: `pair-${index + 1}-do`,
      type: "do",
      component: "minimal-pair",
      label: `Pair ${index + 1}`,
      config: {
        prompt: item.prompt,
        optionA: item.optionA,
        optionB: item.optionB,
        correctId: item.correctId,
        playedId,
        languageCode: DEFAULT_LANG,
      },
    });
  });

  return {
    methodId: "minimal-pairs",
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: { items: ["Headphones", "Tap the word you heard"] },
      },
      ...loop,
      {
        id: "decide-1",
        type: "decide",
        component: "summary",
        label: "Done",
        config: {
          body: "You practised hearing fine differences. Self-check only — no score.",
        },
      },
    ],
  };
}

export function resolveMinimalPairsRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeMinimalPairsRecipe(ctx);
}
