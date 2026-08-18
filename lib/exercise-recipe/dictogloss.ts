import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_PARTIAL_DICTATION_SOURCE_ID } from "@/lib/content-source-constants";
import { dictationAudioConfig } from "@/lib/exercise-step-audio";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { computeCoverage, type Source } from "@/lib/coverage";
import { dictationSentenceFromSource } from "@/lib/dictation-sentence";
import { resolveMaterialUnit } from "@/lib/material-unit";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

export function composeDictoglossRecipe(source: Source, ctx: SessionContext): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const unit = resolveMaterialUnit(source, "full", {
    lexicon: lexicon ?? undefined,
    heldLemmas: ctx.heldLemmas,
  });
  const coverage = lexicon
    ? computeCoverage(unit.text, lexicon, ctx.heldLemmas ?? new Set())
    : {
        coveragePercent: 0,
        tokenCount: 0,
        knownCount: 0,
        comfortBand: "demanding" as const,
      };
  const sentence = dictationSentenceFromSource(source);
  const audio = dictationAudioConfig(source, sentence);

  return {
    methodId: "dictogloss",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: { items: ["Headphones", "Pen or keyboard"] },
      },
      {
        id: "prepare-preview",
        type: "prepare",
        component: "material-preview",
        label: "Text",
        config: {
          title: source.title,
          unitId: "full",
          coveragePercent: coverage.coveragePercent,
          comfortBand: coverage.comfortBand,
          tokenCount: coverage.tokenCount,
        },
      },
      {
        id: "listen-1",
        type: "do",
        component: "audio-play",
        label: "First listen",
        config: {
          body: "Listen once — do not write yet.",
          transcript: sentence,
          ...audio,
        },
      },
      {
        id: "wait-1",
        type: "wait",
        label: "Pause",
        config: { durationSec: 30 },
      },
      {
        id: "listen-2",
        type: "do",
        component: "audio-play",
        label: "Second listen",
        config: {
          body: "Listen again and note what you can.",
          transcript: sentence,
          ...audio,
        },
      },
      {
        id: "reconstruct-1",
        type: "do",
        component: "type-freely",
        label: "Reconstruct",
        config: {
          prompt: "Write the passage from memory — close is fine.",
        },
      },
      {
        id: "review-1",
        type: "review",
        component: "diff-highlight",
        label: "Compare",
        config: { reference: sentence },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Try another dictogloss"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveDictoglossRecipe(
  ctx: SessionContext,
  findSource: (id: string) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ExerciseRecipe | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_PARTIAL_DICTATION_SOURCE_ID;
  const source = await findSource(resolvedId);
  if (!source) return null;
  return composeDictoglossRecipe(source, ctx);
}
