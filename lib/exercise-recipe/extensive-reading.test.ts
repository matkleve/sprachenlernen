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

  it("builds material-preview, text-display, comprehension, and offers", () => {
    const source = findContentSourceById(DEFAULT_EXTENSIVE_READING_SOURCE_ID)!;
    const recipe = composeExtensiveReadingRecipe(source, { methodId: "extensive-reading" });

    expect(recipe.methodId).toBe("extensive-reading");
    expect(recipe.steps.map((step) => step.component)).toEqual([
      "material-preview",
      "text-display",
      "comprehension-questions",
      "offers",
    ]);
    expect(recipe.steps[1]?.config.text).toContain("gobierno");
    expect(recipe.steps[2]?.config.questions).toBeTruthy();
  });

  it("defaults to es-catalogue-chile without sourceId", async () => {
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
});
