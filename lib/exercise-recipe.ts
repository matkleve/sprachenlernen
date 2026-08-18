import {
  composeExerciseRecipe,
  hasRecipeComposer,
  toSessionContext,
} from "@/lib/exercise-recipe/composer";
import type { ResolveRecipeOptions } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { hasExerciseRecipe } from "@/lib/exercise-recipe-built";

export { hasExerciseRecipe } from "@/lib/exercise-recipe-built";

function normalizeOptions(
  options: ResolveRecipeOptions | string | null | undefined,
): ResolveRecipeOptions {
  if (typeof options === "string") return { sourceId: options };
  if (options === null || options === undefined) return {};
  return options;
}

/**
 * Resolve recipe for `/practice`. Returns null when the method has no built
 * engine yet — the route shows honest not-built copy.
 *
 * Server-only — imports catalogue sources from disk.
 */
export async function resolveExerciseRecipe(
  methodId: string,
  options: ResolveRecipeOptions | string | null = {},
): Promise<ExerciseRecipe | null> {
  if (!hasExerciseRecipe(methodId)) return null;
  if (!hasRecipeComposer(methodId)) return null;

  const ctx = toSessionContext(methodId, normalizeOptions(options));
  return composeExerciseRecipe(ctx);
}
