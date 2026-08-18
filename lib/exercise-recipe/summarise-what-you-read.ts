import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

import {
  resolveDefaultReadingSource,
  type ReadingMaterialBundle,
} from "@/lib/exercise-recipe/reading-source";

export function composeSummariseWhatYouReadRecipe(
  material: ReadingMaterialBundle,
  ctx: SessionContext,
): ExerciseRecipe {
  const { source, unitId, text, coveragePercent, comfortBand, tokenCount } = material;
  const durationSec = ctx.durationSec ?? 300;

  return {
    methodId: "summarise-what-you-read",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "material-preview",
        label: "Your text",
        config: {
          title: source.title,
          unitId,
          coveragePercent,
          comfortBand,
          tokenCount,
        },
      },
      {
        id: "read-1",
        type: "do",
        component: "text-display",
        label: "Read",
        config: {
          title: source.title,
          text,
        },
      },
      {
        id: "wait-1",
        type: "wait",
        label: "Close the text",
        config: { durationSec: 45 },
      },
      {
        id: "write-1",
        type: "do",
        component: "timed-write",
        label: "Summarise",
        config: {
          prompt: "Write a short summary in your own words — shorter than the original.",
          durationSec,
        },
      },
      {
        id: "review-1",
        type: "review",
        component: "feedback",
        label: "Review",
        config: { answerKey: text },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Save a phrase as a card"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveSummariseWhatYouReadRecipe(
  ctx: SessionContext,
): Promise<ExerciseRecipe | null> {
  const material = await resolveDefaultReadingSource(ctx);
  if (!material) return null;
  return composeSummariseWhatYouReadRecipe(material, ctx);
}
