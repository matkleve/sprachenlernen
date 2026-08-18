import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

export function composeRuleAtPointOfErrorRecipe(): ExerciseRecipe {
  return {
    methodId: "rule-at-point-of-error",
    steps: [
      {
        id: "prompt-1",
        type: "do",
        component: "prompt",
        label: "The rule",
        config: {
          body: "When you notice an error — yours or in feedback — read the rule explanation right then. Do not batch corrections for later.",
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "summary",
        label: "Done",
        config: {
          body: "Use this as a micro-session after any exercise that surfaces a mistake, or whenever a correction appears.",
        },
      },
    ],
  };
}

export function resolveRuleAtPointOfErrorRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeRuleAtPointOfErrorRecipe();
}
