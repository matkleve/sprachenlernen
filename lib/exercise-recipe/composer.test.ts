/**
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { describe, expect, it } from "vitest";

import { expandItemLoop, withStepIds } from "@/lib/exercise-recipe/expand";
import { composeExerciseRecipe, hasRecipeComposer } from "@/lib/exercise-recipe/composer";

describe("exercise-recipe expand", () => {
  it("assigns stable ids to step templates", () => {
    const steps = withStepIds("block", [{ type: "do", config: {} }]);
    expect(steps[0]?.id).toBe("block-1");
  });

  it("expands item loops with per-item labels", () => {
    const steps = expandItemLoop(2, "item", [
      { type: "do", label: "Listen", config: {} },
    ]);
    expect(steps).toHaveLength(2);
    expect(steps[0]?.label).toBe("Listen (1/2)");
    expect(steps[1]?.label).toBe("Listen (2/2)");
  });
});

describe("exercise-recipe composer registry", () => {
  it("registers partial-dictation composer", () => {
    expect(hasRecipeComposer("partial-dictation")).toBe(true);
    expect(hasRecipeComposer("full-dictation")).toBe(false);
  });

  it("composes short variant with six steps total", async () => {
    const recipe = await composeExerciseRecipe({
      methodId: "partial-dictation",
      variantId: "short",
    });
    expect(recipe?.steps).toHaveLength(6);
  });

  it("composes standard variant with more dictation loops", async () => {
    const recipe = await composeExerciseRecipe({
      methodId: "partial-dictation",
      variantId: "standard",
    });
    expect(recipe?.steps.length).toBeGreaterThan(6);
    const doSteps = recipe?.steps.filter((step) => step.type === "do") ?? [];
    expect(doSteps.length).toBeGreaterThan(1);
  });
});
