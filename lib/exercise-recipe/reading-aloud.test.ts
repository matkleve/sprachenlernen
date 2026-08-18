/**
 * Contract: docs/specs/service/exercise-recipe-composer.methods.md
 */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXTENSIVE_READING_SOURCE_ID,
  findContentSourceById,
} from "@/lib/content-sources";
import {
  composeReadingAloudRecipe,
  resolveReadingAloudRecipe,
} from "@/lib/exercise-recipe/reading-aloud";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";

describe("reading aloud recipe", () => {
  const catalogueOnly = (id: string) => findContentSourceById(id);

  it("builds checklist, text-display, speak-prompt, and summary", () => {
    const source = findContentSourceById(DEFAULT_EXTENSIVE_READING_SOURCE_ID)!;
    const recipe = composeReadingAloudRecipe(source, { methodId: "reading-aloud" });

    expect(recipe.methodId).toBe("reading-aloud");
    expect(recipe.steps.map((step) => step.component)).toEqual([
      "checklist",
      "text-display",
      "speak-prompt",
      "summary",
    ]);
    expect(recipe.steps[1]?.config.text).toContain("gobierno");
    expect(recipe.steps[2]?.config.text).toContain("gobierno");
  });

  it("defaults to es-catalogue-chile without sourceId", async () => {
    const recipe = await resolveReadingAloudRecipe(
      { methodId: "reading-aloud" },
      catalogueOnly,
    );
    expect(recipe?.sourceId).toBe(DEFAULT_EXTENSIVE_READING_SOURCE_ID);
  });
});

describe("resolveExerciseRecipe reading-aloud", () => {
  it("returns a recipe for reading-aloud", async () => {
    const recipe = await resolveExerciseRecipe("reading-aloud");
    expect(recipe?.methodId).toBe("reading-aloud");
    expect(recipe?.steps).toHaveLength(4);
  });
});
