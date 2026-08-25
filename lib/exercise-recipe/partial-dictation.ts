import { resolveContentSourceById } from "@/lib/content-source-resolve";
import {
  DEFAULT_PARTIAL_DICTATION_SOURCE_ID,
} from "@/lib/content-sources";
import { buildGapFillLine } from "@/lib/gap-selection";
import { dictationAudioConfig } from "@/lib/exercise-step-audio";
import {
  dictationSentencesForVariant,
  dictationWaitSecForVariant,
  resolvedVariantId,
} from "@/lib/exercise-recipe/dictation-shared";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";
import type { Source } from "@/lib/coverage";
import { loadLexiconForLanguage } from "@/lib/shipped-language";
import type { Lexicon } from "@/lib/lexicon";

function gapLineForSentence(
  sentence: string,
  lexicon: Lexicon | null,
  heldLemmas?: ReadonlySet<string>,
) {
  return lexicon
    ? buildGapFillLine(sentence, lexicon, { heldLemmas })
    : {
        sentence,
        gappedIndices: [],
        tokens: sentence.split(/\s+/).map((text) => ({ text, gapped: false })),
      };
}

export function composePartialDictationRecipe(
  source: Source,
  ctx: SessionContext,
): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const variantId = resolvedVariantId(ctx);
  const sentences = dictationSentencesForVariant(source, { ...ctx, variantId }, lexicon);
  const waitSec = dictationWaitSecForVariant(variantId);

  const dictationLoop: ExerciseStep[] = [];
  sentences.forEach((sentence, index) => {
    const gapLine = gapLineForSentence(sentence, lexicon, ctx.heldLemmas);
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
          ...dictationAudioConfig(source, sentence),
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
      // `summary`, not `offers` — scheduling errors as cards is not implemented;
      // fake offer buttons only advanced the step (exercise-runner.md).
      {
        id: "decide-1",
        type: "decide",
        component: "summary",
        label: "Next",
        config: {},
      },
    ],
  };
}

export async function resolvePartialDictationRecipe(
  ctx: SessionContext,
  findSource: (
    id: string,
    options?: import("@/lib/content-source-resolve").ResolveContentSourceOptions,
  ) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ExerciseRecipe | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_PARTIAL_DICTATION_SOURCE_ID;
  const source = await findSource(resolvedId, {
    adapted: ctx.adapted,
    targetLevel: ctx.targetLevel,
    heldLemmaCount: ctx.heldLemmas?.size,
    heldLemmas: ctx.heldLemmas,
  });
  if (!source) return null;
  return composePartialDictationRecipe(source, ctx);
}
