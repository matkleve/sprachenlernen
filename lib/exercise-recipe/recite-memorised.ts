import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

import {
  resolveDefaultReadingSource,
  type ReadingMaterialBundle,
} from "@/lib/exercise-recipe/reading-source";

export function composeReciteMemorisedRecipe(
  material: ReadingMaterialBundle,
): ExerciseRecipe {
  const { source, unitId, text, coveragePercent, comfortBand, tokenCount } = material;

  return {
    methodId: "recite-memorised",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "material-preview",
        label: "Memorise this",
        config: {
          title: source.title,
          unitId,
          coveragePercent,
          comfortBand,
          tokenCount,
        },
      },
      {
        id: "speak-1",
        type: "do",
        component: "speak-prompt",
        label: "Recite",
        config: {
          body: "Recite the passage from memory — rhythm and wording, not a cold read.",
          text,
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "summary",
        label: "Done",
        config: {
          body: "You practised recall and pronunciation. Repeat tomorrow if the lines are still shaky.",
        },
      },
    ],
  };
}

export async function resolveReciteMemorisedRecipe(
  ctx: SessionContext,
): Promise<ExerciseRecipe | null> {
  const material = await resolveDefaultReadingSource(ctx);
  if (!material) return null;
  return composeReciteMemorisedRecipe(material);
}
