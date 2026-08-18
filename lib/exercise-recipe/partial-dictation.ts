import {
  DEFAULT_PARTIAL_DICTATION_SOURCE_ID,
  findContentSourceById,
} from "@/lib/content-sources";
import { resolveMaterialUnit } from "@/lib/material-unit";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { gappedSentence } from "@/lib/content-sources";
import type { Source } from "@/lib/coverage";

export function buildPartialDictationRecipe(source: Source): ExerciseRecipe {
  const sentence = resolveMaterialUnit(source, "sentence").text;
  const gapped = gappedSentence(sentence);

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
      {
        id: "do-1",
        type: "do",
        component: "prompt",
        label: "Listen",
        config: {
          body: `Fill in the gaps: ${gapped}`,
        },
      },
      {
        id: "wait-1",
        type: "wait",
        label: "Pause",
        config: { durationSec: 30 },
      },
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
        config: { answerKey: sentence },
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

export function resolvePartialDictationRecipe(
  sourceId?: string | null,
  findSource: typeof findContentSourceById = findContentSourceById,
): ExerciseRecipe | null {
  const resolvedId = sourceId ?? DEFAULT_PARTIAL_DICTATION_SOURCE_ID;
  const source = findSource(resolvedId);
  if (!source) return null;
  return buildPartialDictationRecipe(source);
}
