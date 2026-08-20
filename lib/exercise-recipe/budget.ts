/**
 * Session wall-clock estimates for hosted methods.
 * Contract: docs/specs/service/method-session-budget.md
 */
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

export const SEC_PER_CARD = 35;
export const RUNNER_CHROME_OVERHEAD_SEC = 120;
export const CARD_CHROME_OVERHEAD_SEC = 60;
export const BUDGET_TOLERANCE_MIN = 0.85;
export const BUDGET_TOLERANCE_MAX = 1.15;

export type BudgetFamily = "card" | "item-loop" | "timed-write" | "read-window" | "fixed";

export type MethodBudgetProfile = {
  family: BudgetFamily;
  secPerItem?: number;
  waitSecPerItem?: number;
  minItems?: number;
  maxItems?: number;
  chromeOverheadSec?: number;
};

const METHOD_BUDGET_PROFILES: Record<string, MethodBudgetProfile> = {
  "srs-session": { family: "card", chromeOverheadSec: CARD_CHROME_OVERHEAD_SEC },
  "partial-dictation": {
    family: "item-loop",
    secPerItem: 90,
    waitSecPerItem: 30,
    minItems: 1,
    maxItems: 12,
  },
  "full-dictation": {
    family: "item-loop",
    secPerItem: 120,
    waitSecPerItem: 30,
    minItems: 1,
    maxItems: 12,
  },
  "build-a-sentence": {
    family: "item-loop",
    secPerItem: 75,
    minItems: 3,
    maxItems: 5,
  },
  "free-production": { family: "timed-write", chromeOverheadSec: RUNNER_CHROME_OVERHEAD_SEC },
  "extensive-reading": { family: "read-window", chromeOverheadSec: RUNNER_CHROME_OVERHEAD_SEC },
  "reading-aloud": { family: "read-window", chromeOverheadSec: RUNNER_CHROME_OVERHEAD_SEC },
};

export function budgetProfileForMethod(methodId: string): MethodBudgetProfile | undefined {
  return METHOD_BUDGET_PROFILES[methodId];
}

const LEARNING_UNIT_COMPONENTS = new Set([
  "gap-fill",
  "type-with-word",
  "cloze-type",
  "full-dictation",
  "speak-prompt",
]);

const FEEDBACK_COMPONENTS = new Set([
  "self-mark",
  "compare",
  "diff-highlight",
  "feedback",
  "rubric",
  "comprehension-questions",
  "reveal-answer",
]);

const PRODUCTION_COMPONENTS = new Set([
  "type-with-word",
  "timed-write",
  "gap-fill",
  "cloze-type",
  "speak-prompt",
]);

export function countLearningUnits(recipe: ExerciseRecipe): number {
  return recipe.steps.filter(
    (step) =>
      step.type === "do" &&
      step.component !== undefined &&
      LEARNING_UNIT_COMPONENTS.has(step.component),
  ).length;
}

function stepDurationSec(step: ExerciseStep): number {
  const durationSec = step.config.durationSec;
  if (typeof durationSec === "number" && Number.isFinite(durationSec)) {
    return durationSec;
  }
  return 0;
}

/** Wall-clock estimate from a composed recipe + method profile. */
export function estimateWallClockSec(
  recipe: ExerciseRecipe,
  profile: MethodBudgetProfile = budgetProfileForMethod(recipe.methodId) ?? {
    family: "item-loop",
    secPerItem: 90,
  },
): number {
  const chrome = profile.chromeOverheadSec ?? RUNNER_CHROME_OVERHEAD_SEC;
  let active = 0;

  for (const step of recipe.steps) {
    const timed = stepDurationSec(step);
    if (timed > 0) {
      active += timed;
      continue;
    }

    if (step.type === "do" && step.component === "text-display") {
      active += 300;
      continue;
    }

    if (
      step.type === "do" &&
      step.component &&
      LEARNING_UNIT_COMPONENTS.has(step.component) &&
      profile.secPerItem
    ) {
      active += profile.secPerItem;
      continue;
    }

    if (step.type === "review" && step.component && FEEDBACK_COMPONENTS.has(step.component)) {
      active += 60;
    }
  }

  return chrome + active;
}

export function estimateWallClockMinutes(recipe: ExerciseRecipe): number {
  return estimateWallClockSec(recipe) / 60;
}

export function isWithinBudgetTolerance(
  wallClockSec: number,
  budgetMinutes: number,
): boolean {
  const target = budgetMinutes * 60;
  return wallClockSec >= target * BUDGET_TOLERANCE_MIN && wallClockSec <= target * BUDGET_TOLERANCE_MAX;
}

export function cardCountForBudgetMinutes(budgetMinutes: number): number {
  const activeSec = budgetMinutes * 60 - CARD_CHROME_OVERHEAD_SEC;
  return Math.max(1, Math.round(activeSec / SEC_PER_CARD));
}

const FEEDBACK_SEC_PER_LOOP = 60;

/** Item-loop methods: do + review feedback per target word. */
export function itemCountForBudgetMinutes(
  budgetMinutes: number,
  profile: MethodBudgetProfile,
): number {
  const chrome = profile.chromeOverheadSec ?? RUNNER_CHROME_OVERHEAD_SEC;
  const activeSec = Math.max(0, budgetMinutes * 60 - chrome);
  const loopSec = (profile.secPerItem ?? 75) + FEEDBACK_SEC_PER_LOOP;
  const raw = loopSec > 0 ? Math.floor(activeSec / loopSec) : 0;
  const min = profile.minItems ?? 1;
  const max = profile.maxItems ?? 5;
  return Math.min(max, Math.max(min, raw));
}
