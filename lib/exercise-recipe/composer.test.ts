/**
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { expandItemLoop, withStepIds } from "@/lib/exercise-recipe/expand";
import { composeExerciseRecipe, hasRecipeComposer } from "@/lib/exercise-recipe/composer";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";

const METHOD_ROW = /^\| `([a-z0-9-]+)` \| (runner|card|off) \|/gm;

function methodIdsFromComposerSpec(): string[] {
  const md = readFileSync(
    join(process.cwd(), "docs/specs/service/exercise-recipe-composer.methods.md"),
    "utf8",
  );
  return [...md.matchAll(METHOD_ROW)].map((match) => match[1]!);
}

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

describe("resolveExerciseRecipe (composer AC)", () => {
  it("AC-1: partial-dictation returns all six step types", async () => {
    const recipe = await resolveExerciseRecipe("partial-dictation");
    expect(recipe).not.toBeNull();
    const types = new Set(recipe?.steps.map((step) => step.type));
    expect(types).toEqual(new Set(["prepare", "do", "wait", "submit", "review", "decide"]));
  });

  it("AC-2: returns null when no composer is registered", async () => {
    expect(await resolveExerciseRecipe("full-dictation")).toBeNull();
  });

  it("AC-3: short variant has exactly one do step", async () => {
    const recipe = await resolveExerciseRecipe("partial-dictation", { variantId: "short" });
    expect(recipe?.steps.filter((step) => step.type === "do")).toHaveLength(1);
  });

  it("AC-4: every method id in the composer spec exists in the catalogue", () => {
    const { catalogue } = loadMethodCatalogue();
    const catalogueIds = new Set(
      catalogue.entries.filter((entry) => entry.type === "method").map((entry) => entry.id),
    );
    const missing = methodIdsFromComposerSpec().filter((id) => !catalogueIds.has(id));
    expect(missing).toEqual([]);
  });
});
