import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_EXTENSIVE_READING_SOURCE_ID } from "@/lib/content-source-constants";
import { dictationAudioConfig } from "@/lib/exercise-step-audio";
import { comprehensionQuestionsForSource } from "@/lib/exercise-recipe/comprehension-questions";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import type { Source } from "@/lib/coverage";
import { dictationSentenceFromSource } from "@/lib/dictation-sentence";

export function composeListeningLevel1Recipe(source: Source): ExerciseRecipe {
  const sentence = dictationSentenceFromSource(source);
  const questions = comprehensionQuestionsForSource(source.id);

  return {
    methodId: "listening-level-1",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: {
          items: ["Headphones or speakers", "A quiet moment"],
        },
      },
      {
        id: "listen-1",
        type: "do",
        component: "audio-play",
        label: "Listen",
        config: {
          body: "Listen once without reading. Replay if you need to.",
          transcript: sentence,
          ...dictationAudioConfig(source, sentence),
        },
      },
      {
        id: "review-1",
        type: "review",
        component: "comprehension-questions",
        label: "Check understanding",
        config: { questions },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Listen again tomorrow", "Save a word as a card"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveListeningLevel1Recipe(
  ctx: SessionContext,
  findSource: (id: string) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ExerciseRecipe | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_EXTENSIVE_READING_SOURCE_ID;
  const source = await findSource(resolvedId);
  if (!source) return null;
  return composeListeningLevel1Recipe(source);
}
