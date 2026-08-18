/**
 * Per-Method recipe composers. Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { resolveBuildASentenceRecipe } from "@/lib/exercise-recipe/build-a-sentence";
import { resolveClozeSentencesRecipe } from "@/lib/exercise-recipe/cloze-sentences";
import { resolveDiaryThreeSentencesRecipe } from "@/lib/exercise-recipe/diary-three-sentences";
import { resolveDictoglossRecipe } from "@/lib/exercise-recipe/dictogloss";
import { resolveExtensiveReadingRecipe } from "@/lib/exercise-recipe/extensive-reading";
import { resolveFourThreeTwoRecipe } from "@/lib/exercise-recipe/four-three-two";
import { resolveFreeProductionRecipe } from "@/lib/exercise-recipe/free-production";
import { resolveFullDictationRecipe } from "@/lib/exercise-recipe/full-dictation";
import { isGuidedMethodId, resolveGuidedRecipe } from "@/lib/exercise-recipe/guided";
import { resolveIntensiveReadingRecipe } from "@/lib/exercise-recipe/intensive-reading";
import { resolveListeningLevel1Recipe } from "@/lib/exercise-recipe/listening-level-1";
import { resolveMinimalPairsRecipe } from "@/lib/exercise-recipe/minimal-pairs";
import { resolveNarrowReadingRecipe } from "@/lib/exercise-recipe/narrow-reading";
import { resolvePartialDictationRecipe } from "@/lib/exercise-recipe/partial-dictation";
import { resolveReadingAloudRecipe } from "@/lib/exercise-recipe/reading-aloud";
import { resolveReciteMemorisedRecipe } from "@/lib/exercise-recipe/recite-memorised";
import { resolveRetellWhatYouReadRecipe } from "@/lib/exercise-recipe/retell-what-you-read";
import { resolveRuleAtPointOfErrorRecipe } from "@/lib/exercise-recipe/rule-at-point-of-error";
import { resolveSummariseWhatYouReadRecipe } from "@/lib/exercise-recipe/summarise-what-you-read";
import type { RecipeComposer, SessionContext } from "@/lib/exercise-recipe/types";

const COMPOSERS: Record<string, RecipeComposer> = {
  "partial-dictation": (ctx) => resolvePartialDictationRecipe(ctx),
  "full-dictation": (ctx) => resolveFullDictationRecipe(ctx),
  "extensive-reading": (ctx) => resolveExtensiveReadingRecipe(ctx),
  "reading-aloud": (ctx) => resolveReadingAloudRecipe(ctx),
  "listening-level-1": (ctx) => resolveListeningLevel1Recipe(ctx),
  "build-a-sentence": (ctx) => resolveBuildASentenceRecipe(ctx),
  "cloze-sentences": (ctx) => resolveClozeSentencesRecipe(ctx),
  "minimal-pairs": (ctx) => resolveMinimalPairsRecipe(ctx),
  "free-production": (ctx) => resolveFreeProductionRecipe(ctx),
  "dictogloss": (ctx) => resolveDictoglossRecipe(ctx),
  "four-three-two": (ctx) => resolveFourThreeTwoRecipe(ctx),
  "diary-three-sentences": (ctx) => resolveDiaryThreeSentencesRecipe(ctx),
  "narrow-reading": (ctx) => resolveNarrowReadingRecipe(ctx),
  "intensive-reading": (ctx) => resolveIntensiveReadingRecipe(ctx),
  "retell-what-you-read": (ctx) => resolveRetellWhatYouReadRecipe(ctx),
  "recite-memorised": (ctx) => resolveReciteMemorisedRecipe(ctx),
  "summarise-what-you-read": (ctx) => resolveSummariseWhatYouReadRecipe(ctx),
  "rule-at-point-of-error": (ctx) => resolveRuleAtPointOfErrorRecipe(ctx),
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
