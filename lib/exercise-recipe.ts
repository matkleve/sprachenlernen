import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { FIXTURE_EXERCISE_RECIPE } from "@/lib/exercise-runner/fixture-recipe";

/** Hosted methods with a runnable exercise recipe (T-E6 grows this set). */
const BUILT_EXERCISE_METHOD_IDS = new Set<string>(["partial-dictation"]);

export function hasExerciseRecipe(methodId: string): boolean {
  return BUILT_EXERCISE_METHOD_IDS.has(methodId);
}

/**
 * Resolve recipe for `/practice`. Returns null when the method has no built
 * engine yet — the route shows honest not-built copy.
 */
export function resolveExerciseRecipe(
  methodId: string,
  sourceId?: string | null,
): ExerciseRecipe | null {
  if (!hasExerciseRecipe(methodId)) return null;

  if (methodId === "partial-dictation") {
    return {
      ...FIXTURE_EXERCISE_RECIPE,
      methodId,
      sourceId: sourceId ?? FIXTURE_EXERCISE_RECIPE.sourceId,
    };
  }

  return null;
}
