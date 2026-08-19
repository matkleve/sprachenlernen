/**
 * Hosted session viability gates (study/42).
 * Contract: docs/specs/service/method-session-viability.md
 */
import {
  BUDGET_TOLERANCE_MIN,
  BUDGET_TOLERANCE_MAX,
  budgetProfileForMethod,
  countLearningUnits,
  estimateWallClockSec,
} from "@/lib/exercise-recipe/budget";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

export type ViabilityGate = "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";

export type SessionViabilityResult = {
  ok: boolean;
  failures: ViabilityGate[];
};

function hasRetrievalStep(recipe: ExerciseRecipe): boolean {
  return recipe.steps.some(
    (step) =>
      step.type === "do" &&
      step.component !== "checklist" &&
      step.component !== "material-preview" &&
      step.component !== "text-display",
  );
}

function productionDoSteps(recipe: ExerciseRecipe): ExerciseStep[] {
  return recipe.steps.filter(
    (step) =>
      step.type === "do" &&
      step.component !== undefined &&
      ["type-with-word", "timed-write", "gap-fill", "cloze-type", "speak-prompt"].includes(
        step.component,
      ),
  );
}

function reviewFollowsProduction(recipe: ExerciseRecipe): boolean {
  const productionIds = new Set(
    productionDoSteps(recipe).map((step) => step.id),
  );
  if (productionIds.size === 0) return true;

  const reviewComponents = new Set([
    "self-mark",
    "compare",
    "diff-highlight",
    "feedback",
    "rubric",
    "reveal-answer",
  ]);

  for (const step of recipe.steps) {
    if (step.type !== "review" || !step.component) continue;
    if (!reviewComponents.has(step.component)) continue;

    if (step.component === "reveal-answer") {
      const exemplar = step.config.exemplar;
      const honestyKey = step.config.honestyKey;
      if (typeof exemplar === "string" && exemplar.trim()) return true;
      if (typeof honestyKey === "string" && honestyKey.trim()) return true;
      return false;
    }

    return true;
  }

  return false;
}

function timedWriteSec(recipe: ExerciseRecipe): number {
  return recipe.steps.reduce((sum, step) => {
    if (step.component !== "timed-write") return sum;
    const durationSec = step.config.durationSec;
    return typeof durationSec === "number" ? sum + durationSec : sum;
  }, 0);
}

function passesVolumeGate(recipe: ExerciseRecipe): boolean {
  const units = countLearningUnits(recipe);
  if (units >= 3) return true;
  if (timedWriteSec(recipe) >= 480) return true;
  return false;
}

export function checkSessionViability(
  recipe: ExerciseRecipe,
  options?: { budgetMinutes?: number },
): SessionViabilityResult {
  const failures: ViabilityGate[] = [];

  if (!hasRetrievalStep(recipe)) failures.push("G1");

  const productionSteps = productionDoSteps(recipe);
  if (productionSteps.length > 0 && !reviewFollowsProduction(recipe)) {
    failures.push("G2");
  }

  if (!passesVolumeGate(recipe)) failures.push("G3");

  if (productionSteps.length > 0) {
    const doIndices = recipe.steps
      .map((step, index) => (step.type === "do" ? index : -1))
      .filter((index) => index >= 0);
    const reviewIndices = recipe.steps
      .map((step, index) => (step.type === "review" ? index : -1))
      .filter((index) => index >= 0);
    if (doIndices.length > 0 && reviewIndices.length === 0) {
      failures.push("G5");
    }
  }

  const budgetMinutes = options?.budgetMinutes;
  if (budgetMinutes !== undefined) {
    const profile = budgetProfileForMethod(recipe.methodId);
    const wallSec = estimateWallClockSec(recipe, profile);
    const target = budgetMinutes * 60;
    if (wallSec < target * BUDGET_TOLERANCE_MIN || wallSec > target * BUDGET_TOLERANCE_MAX) {
      failures.push("G7");
    }
  }

  return { ok: failures.length === 0, failures };
}

export function assertSessionViable(
  recipe: ExerciseRecipe,
  options?: { budgetMinutes?: number },
): SessionViabilityResult {
  return checkSessionViability(recipe, options);
}
