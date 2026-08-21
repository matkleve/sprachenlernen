import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_EXTENSIVE_READING_SOURCE_ID } from "@/lib/content-source-constants";
import { comprehensionQuestionsForSource } from "@/lib/exercise-recipe/comprehension-questions";
import { extensiveReadingDurationSec } from "@/lib/exercise-recipe/read-window-budget";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { computeCoverage, type Source } from "@/lib/coverage";
import { resolveMaterialUnit, type MaterialUnitId } from "@/lib/material-unit";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

function readingUnitId(ctx: SessionContext): MaterialUnitId {
  if (ctx.unitId) return ctx.unitId;
  return "full";
}

export function composeExtensiveReadingRecipe(
  source: Source,
  ctx: SessionContext,
): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const unitId = readingUnitId(ctx);
  const readDurationSec =
    unitId === "window" ? extensiveReadingDurationSec(ctx) : undefined;
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

  const questions = comprehensionQuestionsForSource(source.id);

  return {
    methodId: "extensive-reading",
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
          coveragePercent: coverage.coveragePercent,
          comfortBand: coverage.comfortBand,
          tokenCount: coverage.tokenCount,
        },
      },
      {
        id: "read-1",
        type: "do",
        component: "text-display",
        label: "Read",
        config: {
          title: source.title,
          text: unit.text,
          ...(readDurationSec !== undefined ? { durationSec: readDurationSec } : {}),
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
          offers: ["Save a word as a card", "Read something else"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveExtensiveReadingRecipe(
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
  return composeExtensiveReadingRecipe(source, ctx);
}
