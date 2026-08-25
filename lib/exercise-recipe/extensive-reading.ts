import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_EXTENSIVE_READING_SOURCE_ID } from "@/lib/content-source-constants";
import { comprehensionQuestionsForSource } from "@/lib/exercise-recipe/comprehension-questions";
import { extensiveReadingDurationSec } from "@/lib/exercise-recipe/read-window-budget";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";
import { computeCoverage, type Source } from "@/lib/coverage";
import {
  resolveMaterialUnit,
  resolveSequentialReadWindows,
  type MaterialUnitId,
} from "@/lib/material-unit";
import {
  readUnitIdForSession,
  timedReadDurationSec,
} from "@/lib/read-session-material";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

function readingUnitId(ctx: SessionContext): MaterialUnitId {
  if (ctx.unitId) return ctx.unitId;
  return readUnitIdForSession(undefined, ctx.budgetMinutes);
}

function readWindowsForRecipe(
  source: Source,
  shownBody: string,
  ctx: SessionContext,
  lexicon: ReturnType<typeof loadLexiconForLanguage>,
): Array<{ text: string; durationSec: number }> {
  const unitId = readingUnitId(ctx);
  if (unitId !== "window" || ctx.budgetMinutes === undefined) {
    const unit = resolveMaterialUnit(
      { ...source, body: shownBody },
      unitId,
      {
        durationSec: ctx.durationSec,
        lexicon: lexicon ?? undefined,
        heldLemmas: ctx.heldLemmas,
      },
    );
    return [{ text: unit.text, durationSec: unit.durationSec ?? 300 }];
  }

  const totalSec = extensiveReadingDurationSec(ctx) ?? timedReadDurationSec("extensive-reading", ctx.budgetMinutes);
  const windows = resolveSequentialReadWindows(shownBody, totalSec, {
    lexicon: lexicon ?? undefined,
    heldLemmas: ctx.heldLemmas,
  });
  return windows.map((window) => ({ text: window.text, durationSec: window.durationSec }));
}

export function composeExtensiveReadingRecipe(
  source: Source,
  ctx: SessionContext,
): ExerciseRecipe {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const unitId = readingUnitId(ctx);
  const shownBody = source.body ?? "";
  const readWindows = readWindowsForRecipe(source, shownBody, ctx, lexicon);
  const primaryText = readWindows[0]?.text ?? shownBody;
  const coverage = lexicon
    ? computeCoverage(primaryText, lexicon, ctx.heldLemmas ?? new Set())
    : {
        coveragePercent: 0,
        tokenCount: 0,
        knownCount: 0,
        comfortBand: "demanding" as const,
      };

  const questions = comprehensionQuestionsForSource(source.id);

  const steps: ExerciseStep[] = [
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
  ];

  for (const [index, window] of readWindows.entries()) {
    steps.push({
      id: `read-${index + 1}`,
      type: "do",
      component: "text-display",
      label: readWindows.length > 1 ? `Read (${index + 1}/${readWindows.length})` : "Read",
      config: {
        title: source.title,
        text: window.text,
        durationSec: window.durationSec,
      },
    });
  }

  steps.push(
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
  );

  return {
    methodId: "extensive-reading",
    sourceId: source.id,
    steps,
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
