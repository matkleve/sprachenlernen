import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

import {
  resolveDefaultReadingSource,
  type ReadingMaterialBundle,
} from "@/lib/exercise-recipe/reading-source";

export function composeIntensiveReadingRecipe(material: ReadingMaterialBundle): ExerciseRecipe {
  const { source, unitId, text, coveragePercent, comfortBand, tokenCount } = material;

  return {
    methodId: "intensive-reading",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "material-preview",
        label: "Your paragraph",
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
        label: "Read closely",
        config: {
          title: source.title,
          text,
        },
      },
      {
        id: "review-1",
        type: "review",
        component: "reveal-answer",
        label: "Reference",
        config: {
          answer: text,
          note: "Keep the passage visible while you work through each unclear bit.",
        },
      },
      {
        id: "prompt-1",
        type: "do",
        component: "prompt",
        label: "Work the paragraph",
        config: {
          body: "Mark every word or phrase you cannot explain. Look each one up or ask why it is there.",
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Save a tricky word as a card", "Try another paragraph"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveIntensiveReadingRecipe(
  ctx: SessionContext,
): Promise<ExerciseRecipe | null> {
  const material = await resolveDefaultReadingSource(ctx);
  if (!material) return null;
  return composeIntensiveReadingRecipe(material);
}
