/**
 * Per-Method recipe composers. Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { resolveBuildASentenceRecipe } from "@/lib/exercise-recipe/build-a-sentence";
import { resolveFreeProductionRecipe } from "@/lib/exercise-recipe/free-production";
import { resolveExtensiveReadingRecipe } from "@/lib/exercise-recipe/extensive-reading";
import { resolveFullDictationRecipe } from "@/lib/exercise-recipe/full-dictation";
import { resolvePartialDictationRecipe } from "@/lib/exercise-recipe/partial-dictation";
import { resolveReadingAloudRecipe } from "@/lib/exercise-recipe/reading-aloud";
import type { RecipeComposer, SessionContext } from "@/lib/exercise-recipe/types";

const COMPOSERS: Record<string, RecipeComposer> = {
  "partial-dictation": (ctx) => resolvePartialDictationRecipe(ctx),
  "full-dictation": (ctx) => resolveFullDictationRecipe(ctx),
  "extensive-reading": (ctx) => resolveExtensiveReadingRecipe(ctx),
  "reading-aloud": (ctx) => resolveReadingAloudRecipe(ctx),
  "build-a-sentence": (ctx) => resolveBuildASentenceRecipe(ctx),
  "free-production": (ctx) => resolveFreeProductionRecipe(ctx),
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
    heldLemmas: options.heldLemmas,
  };
}
