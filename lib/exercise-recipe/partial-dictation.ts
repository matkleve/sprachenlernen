import { resolveContentSourceById } from "@/lib/content-source-resolve";
import {
  DEFAULT_PARTIAL_DICTATION_SOURCE_ID,
  pickDictationSentences,
} from "@/lib/content-sources";
import { buildGapFillLine } from "@/lib/gap-selection";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";
import { sourceText, type Source } from "@/lib/coverage";
import { resolveMaterialUnit, type MaterialUnitId } from "@/lib/material-unit";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

const STANDARD_SENTENCE_COUNT = 6;
const LONG_SENTENCE_CAP = 12;
const WAIT_SEC_SHORT = 30;
const WAIT_SEC_STANDARD = 30;
const WAIT_SEC_LONG = 45;

function gapLineForSentence(sentence: string, lexicon: ReturnType<typeof loadLexiconForLanguage>) {
  return lexicon
    ? buildGapFillLine(sentence, lexicon)
    : {
        sentence,
        gappedIndices: [],
        tokens: sentence.split(/\s+/).map((text) => ({ text, gapped: false })),
      };
}

function sentencesForVariant(source: Source, ctx: SessionContext): string[] {
  const variantId = ctx.variantId ?? "short";

  if (variantId === "long") {
    const unitId: MaterialUnitId = ctx.unitId ?? "window";
    const unit = resolveMaterialUnit(source, unitId, { durationSec: ctx.durationSec });
    const picked = pickDictationSentences(unit.text, LONG_SENTENCE_CAP);
    return picked.length > 0 ? picked : [resolveMaterialUnit(source, "sentence").text];
  }

  if (variantId === "standard") {
    const picked = pickDictationSentences(sourceText(source), STANDARD_SENTENCE_COUNT);
    return picked.length > 0 ? picked : [resolveMaterialUnit(source, "sentence").text];
  }

  return [resolveMaterialUnit(source, "sentence").text];
}

function waitSecForVariant(variantId: SessionContext["variantId"]): number {
  if (variantId === "long") return WAIT_SEC_LONG;
  if (variantId === "standard") return WAIT_SEC_STANDARD;
  return WAIT_SEC_SHORT;
}

export function composePartialDictationRecipe(
  source: Source,
  ctx: SessionContext,
): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const sentences = sentencesForVariant(source, ctx);
  const waitSec = waitSecForVariant(ctx.variantId);

  const dictationLoop: ExerciseStep[] = [];
  sentences.forEach((sentence, index) => {
    const gapLine = gapLineForSentence(sentence, lexicon);
    const suffix = sentences.length > 1 ? ` (${index + 1}/${sentences.length})` : "";
    dictationLoop.push(
      {
        id: `dictation-${index + 1}-do`,
        type: "do",
        component: "gap-fill",
        label: `Listen${suffix}`,
        config: {
          sentence,
          tokens: gapLine.tokens,
          audioUrl: source.kind === "audio" ? source.sourceUrl : undefined,
          itemIndex: index + 1,
          itemCount: sentences.length,
        },
      },
      {
        id: `dictation-${index + 1}-wait`,
        type: "wait",
        label: "Pause",
        config: { durationSec: waitSec },
      },
    );
  });

  const answerKey = sentences.join("\n");

  return {
    methodId: "partial-dictation",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: {
          items: ["Headphones or speakers", "Pen and paper or keyboard"],
        },
      },
      ...dictationLoop,
      {
        id: "submit-1",
        type: "submit",
        component: "capture",
        label: "Your result",
        config: { accept: ["photo", "text"], required: true },
      },
      {
        id: "review-1",
        type: "review",
        component: "self-mark",
        label: "Compare",
        config: { answerKey },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Add errors as cards", "Explain one error"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

/** @deprecated Use composePartialDictationRecipe — kept for tests during migration. */
export function buildPartialDictationRecipe(source: Source): ExerciseRecipe {
  return composePartialDictationRecipe(source, {
    methodId: "partial-dictation",
    variantId: "short",
  });
}

export async function resolvePartialDictationRecipe(
  ctx: SessionContext,
  findSource: (id: string) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ExerciseRecipe | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_PARTIAL_DICTATION_SOURCE_ID;
  const source = await findSource(resolvedId);
  if (!source) return null;
  return composePartialDictationRecipe(source, ctx);
}
