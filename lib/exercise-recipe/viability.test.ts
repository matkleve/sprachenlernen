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
import { checkSessionViability, type ViabilityGate } from "@/lib/exercise-recipe/viability";

const BUILT_HOSTED_METHOD_IDS = [
  "partial-dictation",
  "full-dictation",
  "extensive-reading",
  "reading-aloud",
  "build-a-sentence",
  "free-production",
] as const;

/** Until T-MV2/T-MV5 — CI blocks new failures on these methods. */
const KNOWN_VIABILITY_FAILURES: Partial<Record<string, readonly ViabilityGate[]>> = {
  "partial-dictation": ["G3"],
  "full-dictation": ["G3"],
  "extensive-reading": ["G1", "G3"],
  "reading-aloud": ["G2", "G3", "G5"],
};

describe("checkSessionViability", () => {
  it("passes G2 and G3 for build-a-sentence at 8 minutes", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 8 });
    expect(recipe).not.toBeNull();

    const result = checkSessionViability(recipe!);
    expect(result.failures).not.toContain("G2");
    expect(result.failures).not.toContain("G3");
  });

  it("passes G7 for build-a-sentence at 15 min after T-MV2", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 15 });
    const result = checkSessionViability(recipe!, { budgetMinutes: 15 });
    expect(result.failures).not.toContain("G7");
  });

  it("still fails G7 for build-a-sentence at 3 min", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 3 });
    const result = checkSessionViability(recipe!, { budgetMinutes: 3 });
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

  it("flags out-of-tolerance wall clock for build-a-sentence at 3 min", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 3 });
    const wallSec = estimateWallClockSec(recipe!);
    expect(isWithinBudgetTolerance(wallSec, 3)).toBe(false);
  });
});

describe("hosted recipe CI gate (T-MV1)", () => {
  for (const methodId of BUILT_HOSTED_METHOD_IDS) {
    it(`${methodId} matches viability allowlist or passes all gates`, async () => {
      const recipe = await resolveExerciseRecipe(methodId);
      expect(recipe).not.toBeNull();

      const result = checkSessionViability(recipe!);
      const expected = KNOWN_VIABILITY_FAILURES[methodId];

      if (expected) {
        expect([...result.failures].sort()).toEqual([...expected].sort());
      } else {
        expect(result.failures, methodId).toEqual([]);
        expect(result.ok).toBe(true);
      }
    });
  }
});
