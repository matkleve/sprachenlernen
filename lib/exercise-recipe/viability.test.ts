/**
 * Contract: docs/specs/service/method-session-viability.md
 */
import { describe, expect, it } from "vitest";

import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import {
  cardCountForBudgetMinutes,
  estimateWallClockSec,
  isWithinBudgetTolerance,
} from "@/lib/exercise-recipe/budget";
import { checkSessionViability } from "@/lib/exercise-recipe/viability";

describe("checkSessionViability", () => {
  it("fails G2 and G3 for build-a-sentence today", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence");
    expect(recipe).not.toBeNull();

    const result = checkSessionViability(recipe!);
    expect(result.ok).toBe(false);
    expect(result.failures).toContain("G2");
    expect(result.failures).toContain("G3");
  });

  it("fails G7 for build-a-sentence at 15 min until budget compose ships", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence");
    const result = checkSessionViability(recipe!, { budgetMinutes: 15 });
    expect(result.failures).toContain("G7");
  });

  it("fails G3 for partial-dictation short with one sentence", async () => {
    const recipe = await resolveExerciseRecipe("partial-dictation", { variantId: "short" });
    expect(recipe).not.toBeNull();

    const result = checkSessionViability(recipe!);
    expect(result.failures).toContain("G3");
  });

  it("passes G2 for free-production via feedback step", async () => {
    const recipe = await resolveExerciseRecipe("free-production");
    expect(recipe).not.toBeNull();

    const result = checkSessionViability(recipe!);
    expect(result.failures).not.toContain("G2");
    expect(result.failures).not.toContain("G3");
  });
});

describe("estimateWallClock", () => {
  it("estimates card stream length from budget minutes", () => {
    expect(cardCountForBudgetMinutes(15)).toBe(Math.round((15 * 60 - 60) / 35));
  });

  it("flags out-of-tolerance wall clock for build-a-sentence at 15 min", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence");
    const wallSec = estimateWallClockSec(recipe!);
    expect(isWithinBudgetTolerance(wallSec, 15)).toBe(false);
  });
});
