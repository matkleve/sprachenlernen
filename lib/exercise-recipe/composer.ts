/**
 * Per-Method recipe composers. Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { resolvePartialDictationRecipe } from "@/lib/exercise-recipe/partial-dictation";
import type { RecipeComposer, SessionContext } from "@/lib/exercise-recipe/types";

const COMPOSERS: Record<string, RecipeComposer> = {
  "partial-dictation": (ctx) => resolvePartialDictationRecipe(ctx),
};

export function hasRecipeComposer(methodId: string): boolean {
  return methodId in COMPOSERS;
}

export async function composeExerciseRecipe(
  ctx: SessionContext,
): Promise<import("@/lib/exercise-runner/types").ExerciseRecipe | null> {
  const composer = COMPOSERS[ctx.methodId];
  if (!composer) return null;
  return composer(ctx);
}

export function toSessionContext(
  methodId: string,
  options: import("@/lib/exercise-recipe/types").ResolveRecipeOptions = {},
): SessionContext {
  return {
    methodId,
    sourceId: options.sourceId,
    topicId: options.topicId,
    unitId: options.unitId,
    durationSec: options.durationSec,
    variantId: options.variantId,
  };
}
