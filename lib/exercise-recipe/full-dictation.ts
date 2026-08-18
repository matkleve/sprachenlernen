import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_PARTIAL_DICTATION_SOURCE_ID } from "@/lib/content-sources";
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

export function composeFullDictationRecipe(source: Source, ctx: SessionContext): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const variantId = resolvedVariantId(ctx);
  const sentences = dictationSentencesForVariant(source, { ...ctx, variantId }, lexicon);
  const waitSec = dictationWaitSecForVariant(variantId);

  const dictationLoop: ExerciseStep[] = [];
  sentences.forEach((sentence, index) => {
    const suffix = sentences.length > 1 ? ` (${index + 1}/${sentences.length})` : "";
    dictationLoop.push(
      {
        id: `dictation-${index + 1}-do`,
        type: "do",
        component: "full-dictation",
        label: `Listen${suffix}`,
        config: {
          ...dictationAudioConfig(source, sentence),
          itemIndex: index + 1,
          itemCount: sentences.length,
          readsPerSentence: 3,
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
    methodId: "full-dictation",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: {
          items: ["Headphones or speakers", "Pen and paper"],
        },
      },
      {
        id: "prepare-2",
        type: "prepare",
        component: "sheet-download",
        label: "Worksheet",
        config: {
          title: source.title,
          lineCount: sentences.length,
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

export async function resolveFullDictationRecipe(
  ctx: SessionContext,
  findSource: (id: string) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ExerciseRecipe | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_PARTIAL_DICTATION_SOURCE_ID;
  const source = await findSource(resolvedId);
  if (!source) return null;
  return composeFullDictationRecipe(source, ctx);
}
