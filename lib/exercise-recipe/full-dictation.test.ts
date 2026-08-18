/**
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_PARTIAL_DICTATION_SOURCE_ID,
  findContentSourceById,
} from "@/lib/content-sources";
import {
  composeFullDictationRecipe,
  resolveFullDictationRecipe,
} from "@/lib/exercise-recipe/full-dictation";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";

describe("full dictation recipe", () => {
  const catalogueOnly = (id: string) => findContentSourceById(id);

  it("defaults to standard variant with six sentences", () => {
    const source = findContentSourceById(DEFAULT_PARTIAL_DICTATION_SOURCE_ID)!;
    const recipe = composeFullDictationRecipe(source, { methodId: "full-dictation" });
    const doSteps = recipe.steps.filter((step) => step.type === "do");
    expect(doSteps.length).toBeGreaterThan(1);
    expect(doSteps.every((step) => step.component === "full-dictation")).toBe(true);
    expect(doSteps[0]?.config.sentence).toBeUndefined();
  });

  it("includes checklist and sheet-download prepare steps", () => {
    const source = findContentSourceById(DEFAULT_PARTIAL_DICTATION_SOURCE_ID)!;
    const recipe = composeFullDictationRecipe(source, { methodId: "full-dictation" });
    const prepare = recipe.steps.filter((step) => step.type === "prepare");
    expect(prepare.map((step) => step.component)).toEqual(["checklist", "sheet-download"]);
  });

  it("resolves from default catalogue source", async () => {
    const recipe = await resolveFullDictationRecipe(
      { methodId: "full-dictation" },
      catalogueOnly,
    );
    expect(recipe?.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
  });
});

describe("resolveExerciseRecipe full-dictation", () => {
  it("returns a recipe for full-dictation", async () => {
    const recipe = await resolveExerciseRecipe("full-dictation");
    expect(recipe?.methodId).toBe("full-dictation");
    expect(recipe?.steps.some((step) => step.component === "full-dictation")).toBe(true);
  });
});
