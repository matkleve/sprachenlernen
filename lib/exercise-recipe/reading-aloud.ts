import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_EXTENSIVE_READING_SOURCE_ID } from "@/lib/content-source-constants";
import { readingAloudDurationSec } from "@/lib/exercise-recipe/read-window-budget";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { computeCoverage, type Source } from "@/lib/coverage";
import { resolveMaterialUnit, type MaterialUnitId } from "@/lib/material-unit";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

function readingUnitId(ctx: SessionContext): MaterialUnitId {
  if (ctx.unitId) return ctx.unitId;
  return ctx.budgetMinutes !== undefined ? "window" : "full";
}

export function composeReadingAloudRecipe(
  source: Source,
  ctx: SessionContext,
): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const unitId = readingUnitId(ctx);
  const readDurationSec = readingAloudDurationSec(ctx);
  const unit = resolveMaterialUnit(source, unitId, {
    durationSec: readDurationSec ?? ctx.durationSec,
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

  return {
    methodId: "reading-aloud",
    sourceId: source.id,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: {
          items: ["A quiet place", "Text you can read comfortably"],
        },
      },
      {
        id: "read-1",
        type: "do",
        component: "text-display",
        label: "Read the passage",
        config: {
          title: source.title,
          text: unit.text,
          coveragePercent: coverage.coveragePercent,
          ...(readDurationSec !== undefined ? { durationSec: readDurationSec } : {}),
        },
      },
      {
        id: "speak-1",
        type: "do",
        component: "speak-prompt",
        label: "Read aloud",
        config: {
          body: "Read the passage out loud at a speaking pace — not faster than you would talk.",
          text: unit.text,
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "summary",
        label: "Done",
        config: {
          body: "You practised pronunciation and flow. Nothing is graded — the work is in your mouth.",
        },
      },
    ],
  };
}

export async function resolveReadingAloudRecipe(
  ctx: SessionContext,
  findSource: (
    id: string,
    options?: import("@/lib/content-source-resolve").ResolveContentSourceOptions,
  ) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ExerciseRecipe | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_EXTENSIVE_READING_SOURCE_ID;
  const source = await findSource(resolvedId, {
    adapted: ctx.adapted,
    targetLevel: ctx.targetLevel,
    heldLemmaCount: ctx.heldLemmas?.size,
    heldLemmas: ctx.heldLemmas,
  });
  if (!source) return null;
  return composeReadingAloudRecipe(source, ctx);
}
