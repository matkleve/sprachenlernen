import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

import {
  resolveDefaultReadingSource,
  splitTextForNarrowReading,
  type ReadingMaterialBundle,
} from "@/lib/exercise-recipe/reading-source";

const TEXT_COUNT = 4;

export function composeNarrowReadingRecipe(material: ReadingMaterialBundle): ExerciseRecipe {
  const { source, coveragePercent } = material;
  const chunks = splitTextForNarrowReading(material.text, TEXT_COUNT);

  const readLoop: ExerciseStep[] = [];
  for (let round = 1; round <= TEXT_COUNT; round += 1) {
    readLoop.push(
      {
        id: `round-${round}-marker`,
        type: "do",
        component: "round-marker",
        label: `Text ${round} of ${TEXT_COUNT}`,
        config: {
          round,
          totalRounds: TEXT_COUNT,
          minutes: 0,
        },
      },
      {
        id: `read-${round}`,
        type: "do",
        component: "text-display",
        label: "Read",
        config: {
          title: source.title,
          text: chunks[round - 1] ?? material.text,
          coveragePercent,
        },
      },
    );
  }

  return {
    methodId: "narrow-reading",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "prompt",
        label: "How this works",
        config: {
          body: `Read ${TEXT_COUNT} short texts on the same topic. Repeated words should start to stick without stopping to study.`,
        },
      },
      ...readLoop,
      {
        id: "decide-1",
        type: "decide",
        component: "summary",
        label: "Done",
        config: {
          body: "You met the same vocabulary several times in one sitting — that is the narrow-reading payoff.",
        },
      },
    ],
  };
}

export async function resolveNarrowReadingRecipe(
  ctx: SessionContext,
): Promise<ExerciseRecipe | null> {
  const material = await resolveDefaultReadingSource(ctx);
  if (!material) return null;
  return composeNarrowReadingRecipe(material);
}
