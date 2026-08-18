/**
 * Shared sentence selection and timing for dictation-family composers.
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { pickDictationSentences } from "@/lib/content-sources";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import { variantIdForMaterialSetup } from "@/lib/exercise-recipe/variant";
import type { RecipeVariantId } from "@/lib/exercise-recipe/types";
import type { Source } from "@/lib/coverage";
import { resolveMaterialUnit, type MaterialUnitId } from "@/lib/material-unit";
import type { Lexicon } from "@/lib/lexicon";

export const STANDARD_SENTENCE_COUNT = 6;
export const LONG_SENTENCE_CAP = 12;
const WAIT_SEC_SHORT = 30;
const WAIT_SEC_STANDARD = 30;
const WAIT_SEC_LONG = 45;

export function defaultVariantForMethod(methodId: string): RecipeVariantId {
  if (methodId === "full-dictation") return "standard";
  return "short";
}

export function resolvedVariantId(ctx: SessionContext): RecipeVariantId {
  return (
    ctx.variantId ??
    (ctx.unitId ? variantIdForMaterialSetup(ctx.methodId, ctx.unitId) : undefined) ??
    defaultVariantForMethod(ctx.methodId)
  );
}

export function dictationSentencesForVariant(
  source: Source,
  ctx: SessionContext,
  lexicon: Lexicon | null,
): string[] {
  const variantId = resolvedVariantId(ctx);
  const unitOptions = {
    durationSec: ctx.durationSec,
    lexicon: lexicon ?? undefined,
    heldLemmas: ctx.heldLemmas,
  };

  if (variantId === "long") {
    const unitId: MaterialUnitId = ctx.unitId ?? "window";
    const unit = resolveMaterialUnit(source, unitId, unitOptions);
    const picked = pickDictationSentences(unit.text, LONG_SENTENCE_CAP);
    return picked.length > 0 ? picked : [resolveMaterialUnit(source, "sentence", unitOptions).text];
  }

  if (variantId === "standard") {
    const unit = resolveMaterialUnit(source, ctx.unitId ?? "paragraph", unitOptions);
    const picked = pickDictationSentences(unit.text, STANDARD_SENTENCE_COUNT);
    return picked.length > 0 ? picked : [resolveMaterialUnit(source, "sentence", unitOptions).text];
  }

  const unit = resolveMaterialUnit(source, ctx.unitId ?? "sentence", unitOptions);
  return [unit.text];
}

export function dictationWaitSecForVariant(variantId: RecipeVariantId): number {
  if (variantId === "long") return WAIT_SEC_LONG;
  if (variantId === "standard") return WAIT_SEC_STANDARD;
  return WAIT_SEC_SHORT;
}
