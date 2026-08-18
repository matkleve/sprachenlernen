import { resolvePartialDictationRecipe } from "@/lib/exercise-recipe/partial-dictation";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { hasExerciseRecipe } from "@/lib/exercise-recipe-built";

export { hasExerciseRecipe } from "@/lib/exercise-recipe-built";

/**
 * Resolve recipe for `/practice`. Returns null when the method has no built
 * engine yet — the route shows honest not-built copy.
 *
 * Server-only — imports catalogue sources from disk.
 */
export function resolveExerciseRecipe(
  methodId: string,
  sourceId?: string | null,
): ExerciseRecipe | null {
  if (!hasExerciseRecipe(methodId)) return null;

  if (methodId === "partial-dictation") {
    return resolvePartialDictationRecipe(sourceId);
  }

  return null;
}
