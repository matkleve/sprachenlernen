import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

import {
  resolveDefaultReadingSource,
  type ReadingMaterialBundle,
} from "@/lib/exercise-recipe/reading-source";

export function composeRetellWhatYouReadRecipe(material: ReadingMaterialBundle): ExerciseRecipe {
  const { source, unitId, text, coveragePercent, comfortBand, tokenCount } = material;

  return {
    methodId: "retell-what-you-read",
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
        label: "Put it away",
        config: { durationSec: 60 },
      },
      {
        id: "speak-1",
        type: "do",
        component: "speak-prompt",
        label: "Retell",
        config: {
          body: "Tell the story out loud from memory — main points, not every word.",
        },
      },
      {
        id: "submit-1",
        type: "submit",
        component: "voice-submit",
        label: "Optional recording",
        config: { required: false, hint: "Optional: keep your retell as a voice memo." },
      },
      {
        id: "review-1",
        type: "review",
        component: "rubric",
        label: "Self-rate",
        config: {
          dimensions: [
            {
              id: "coverage",
              label: "Coverage",
              options: ["Got the main points", "Missed a key bit", "Hard to remember"],
            },
            {
              id: "fluency",
              label: "Fluency",
              options: ["Flowed naturally", "Some pauses", "Stopped often"],
            },
          ],
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Retell another text tomorrow"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveRetellWhatYouReadRecipe(
  ctx: SessionContext,
): Promise<ExerciseRecipe | null> {
  const material = await resolveDefaultReadingSource(ctx);
  if (!material) return null;
  return composeRetellWhatYouReadRecipe(material);
}
