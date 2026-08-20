/**
 * Contract: docs/specs/service/method-session-budget.md
 */
import { describe, expect, it } from "vitest";

import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import {
  budgetProfileForMethod,
  estimateWallClockSec,
  itemCountForBudgetMinutes,
  isWithinBudgetTolerance,
} from "@/lib/exercise-recipe/budget";

describe("itemCountForBudgetMinutes", () => {
  const profile = budgetProfileForMethod("build-a-sentence")!;

  it("returns at least three items for an 8-minute budget", () => {
    expect(itemCountForBudgetMinutes(8, profile)).toBe(3);
  });

  it("scales up to five items for a 15-minute budget", () => {
    expect(itemCountForBudgetMinutes(15, profile)).toBe(5);
  });
});

describe("build-a-sentence budget fit", () => {
  it("estimates within tolerance at 15 minutes after T-MV2", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 15 });
    expect(recipe).not.toBeNull();
    const wallSec = estimateWallClockSec(recipe!);
    expect(isWithinBudgetTolerance(wallSec, 15)).toBe(true);
  });

  it("still falls outside tolerance at the 3-minute catalogue floor", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 3 });
    const wallSec = estimateWallClockSec(recipe!);
    expect(isWithinBudgetTolerance(wallSec, 3)).toBe(false);
  });
});
