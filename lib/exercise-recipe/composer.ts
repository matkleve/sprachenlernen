/**
 * Per-Method recipe composers. Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { resolveExtensiveReadingRecipe } from "@/lib/exercise-recipe/extensive-reading";
import { resolveFullDictationRecipe } from "@/lib/exercise-recipe/full-dictation";
import { isGuidedMethodId, resolveGuidedRecipe } from "@/lib/exercise-recipe/guided";
import { resolvePartialDictationRecipe } from "@/lib/exercise-recipe/partial-dictation";
import { resolveReadingAloudRecipe } from "@/lib/exercise-recipe/reading-aloud";
import type { RecipeComposer, SessionContext } from "@/lib/exercise-recipe/types";

const COMPOSERS: Record<string, RecipeComposer> = {
  "partial-dictation": (ctx) => resolvePartialDictationRecipe(ctx),
  "full-dictation": (ctx) => resolveFullDictationRecipe(ctx),
  "extensive-reading": (ctx) => resolveExtensiveReadingRecipe(ctx),
  "reading-aloud": (ctx) => resolveReadingAloudRecipe(ctx),
};

export function hasRecipeComposer(methodId: string): boolean {
  return methodId in COMPOSERS || isGuidedMethodId(methodId);
}

export async function composeExerciseRecipe(
  ctx: SessionContext,
): Promise<import("@/lib/exercise-runner/types").ExerciseRecipe | null> {
  const composer = COMPOSERS[ctx.methodId];
  if (composer) return composer(ctx);
  if (isGuidedMethodId(ctx.methodId)) return resolveGuidedRecipe(ctx);
  return null;
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
    heldLemmas: options.heldLemmas,
  };
}
