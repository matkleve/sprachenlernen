/**
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXTENSIVE_READING_SOURCE_ID,
  findContentSourceById,
} from "@/lib/content-sources";
import {
  composeExtensiveReadingRecipe,
  resolveExtensiveReadingRecipe,
} from "@/lib/exercise-recipe/extensive-reading";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";

describe("extensive reading recipe", () => {
  const catalogueOnly = (id: string) => findContentSourceById(id);

  it("builds material-preview, timed read windows, comprehension, and offers", () => {
    const source = findContentSourceById(DEFAULT_EXTENSIVE_READING_SOURCE_ID)!;
    const recipe = composeExtensiveReadingRecipe(source, {
      methodId: "extensive-reading",
      budgetMinutes: 20,
      unitId: "window",
    });

    expect(recipe.methodId).toBe("extensive-reading");
    const components = recipe.steps.map((step) => step.component);
    expect(components[0]).toBe("material-preview");
    expect(components.filter((c) => c === "text-display").length).toBeGreaterThan(0);
    expect(components).toContain("comprehension-questions");
    expect(components).toContain("offers");

    const readStep = recipe.steps.find((step) => step.component === "text-display");
    expect(readStep?.config.durationSec).toBeGreaterThan(0);
    expect(readStep?.config.text).toBeTruthy();
  });

  it("defaults to wikinews-es-3516 without sourceId", async () => {
    const recipe = await resolveExtensiveReadingRecipe(
      { methodId: "extensive-reading" },
      catalogueOnly,
    );
    expect(recipe?.sourceId).toBe(DEFAULT_EXTENSIVE_READING_SOURCE_ID);
  });
});

describe("resolveExerciseRecipe extensive-reading", () => {
  it("returns a recipe for extensive-reading", async () => {
    const recipe = await resolveExerciseRecipe("extensive-reading");
    expect(recipe?.methodId).toBe("extensive-reading");
    expect(recipe?.steps).toHaveLength(4);
  });

  it("times read windows from budget minutes", async () => {
    const recipe = await resolveExerciseRecipe("extensive-reading", { budgetMinutes: 20 });
    const readSteps = recipe!.steps.filter((step) => step.component === "text-display");
    expect(readSteps.length).toBeGreaterThan(0);
    expect(readSteps[0]?.config.durationSec).toBeGreaterThan(600);
  });
});
