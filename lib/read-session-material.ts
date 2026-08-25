/**
 * Reading session material sufficiency and window sizing.
 * Contract: docs/specs/service/method-session-budget.md, content-adaptation.md (T-CI4)
 */
import {
  budgetProfileForMethod,
  READ_WINDOW_RUNNER_SEC,
} from "@/lib/exercise-recipe/budget";
import { readWindowDurationSec } from "@/lib/exercise-recipe/budget";
import type { MaterialUnitId } from "@/lib/material-unit";
import { countSentences } from "@/lib/material-unit";

export const READ_METHOD_IDS = new Set(["extensive-reading", "reading-aloud"]);

export function isReadWindowMethod(methodId: string): boolean {
  return READ_METHOD_IDS.has(methodId);
}

export function readUnitIdForSession(
  unitId: MaterialUnitId | undefined,
  budgetMinutes: number | undefined,
): MaterialUnitId {
  if (unitId) return unitId;
  return budgetMinutes !== undefined ? "window" : "full";
}

export function timedReadDurationSec(methodId: string, budgetMinutes: number): number {
  const profile = budgetProfileForMethod(methodId);
  if (!profile || profile.family !== "read-window") {
    return Math.max(180, budgetMinutes * 60 - 240);
  }
  const extra =
    methodId === "reading-aloud"
      ? 120 + 120 // speak + runner chrome in recipe estimate
      : READ_WINDOW_RUNNER_SEC + 60; // comprehension review
  return readWindowDurationSec(budgetMinutes, profile, extra);
}

/** Minimum sentences on screen for a timed reading package — blocks absurdly short bodies. */
export function minSentencesForBudgetMinutes(budgetMinutes: number): number {
  return Math.max(3, Math.round(budgetMinutes / 2.5));
}

export function minWordsForBudgetMinutes(budgetMinutes: number): number {
  return Math.max(40, Math.round(budgetMinutes * 40));
}

export type ReadMaterialSufficiency = {
  sufficient: boolean;
  sentenceCount: number;
  wordCount: number;
  minSentences: number;
  minWords: number;
};

export function assessReadMaterialSufficiency(
  text: string,
  budgetMinutes: number | undefined,
  unitId: MaterialUnitId,
): ReadMaterialSufficiency {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentenceCount = countSentences(trimmed);

  if (budgetMinutes === undefined || unitId !== "window") {
    return {
      sufficient: true,
      sentenceCount,
      wordCount,
      minSentences: 0,
      minWords: 0,
    };
  }

  const minSentences = minSentencesForBudgetMinutes(budgetMinutes);
  const minWords = minWordsForBudgetMinutes(budgetMinutes);
  const sufficient = sentenceCount >= minSentences || wordCount >= minWords;

  return { sufficient, sentenceCount, wordCount, minSentences, minWords };
}
