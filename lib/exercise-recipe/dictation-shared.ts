/**
 * Shared sentence selection and timing for dictation-family composers.
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { pickDictationSentences } from "@/lib/content-sources";
import {
  budgetProfileForMethod,
  itemCountForBudgetMinutes,
} from "@/lib/exercise-recipe/budget";
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

function pickBudgetDictationSentences(
  source: Source,
  ctx: SessionContext,
  lexicon: Lexicon | null,
  count: number,
  variantId: RecipeVariantId,
): string[] {
  const unitOptions = {
    durationSec: ctx.durationSec,
    lexicon: lexicon ?? undefined,
    heldLemmas: ctx.heldLemmas,
  };

  if (variantId === "long") {
    const unitId: MaterialUnitId = ctx.unitId ?? "window";
    const unit = resolveMaterialUnit(source, unitId, {
      ...unitOptions,
      durationSec: ctx.durationSec ?? ctx.budgetMinutes! * 60,
    });
    const picked = pickDictationSentences(unit.text, Math.min(count, LONG_SENTENCE_CAP));
    return picked.length > 0 ? picked : [unit.text];
  }

  const candidates: MaterialUnitId[] = ctx.unitId
    ? [ctx.unitId]
    : variantId === "standard"
      ? ["paragraph"]
      : count > 1
        ? ["paragraph", "window"]
        : ["sentence"];

  let best: string[] = [];
  for (const unitId of candidates) {
    const unit = resolveMaterialUnit(source, unitId, {
      ...unitOptions,
      durationSec: unitId === "window" ? ctx.budgetMinutes! * 60 : unitOptions.durationSec,
    });
    const cap = unitId === "window" ? Math.min(count, LONG_SENTENCE_CAP) : count;
    const picked = pickDictationSentences(unit.text, cap);
    const sentences = picked.length > 0 ? picked : [unit.text];
    if (sentences.length > best.length) best = sentences;
    if (sentences.length >= count) return sentences.slice(0, count);
  }

  return best.length > 0
    ? best
    : [resolveMaterialUnit(source, ctx.unitId ?? "sentence", unitOptions).text];
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

  const profile = budgetProfileForMethod(ctx.methodId);
  if (ctx.budgetMinutes !== undefined && profile?.family === "item-loop") {
    const count = itemCountForBudgetMinutes(ctx.budgetMinutes, profile);
    return pickBudgetDictationSentences(source, ctx, lexicon, count, variantId);
  }

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
