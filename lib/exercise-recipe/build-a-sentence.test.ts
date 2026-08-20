/**
 * Contract: docs/specs/service/exercise-recipe-composer.methods.md
 */
import { describe, expect, it } from "vitest";

import { loadMeaningRecallDeck } from "@/lib/starter-deck";
import { countLearningUnits } from "@/lib/exercise-recipe/budget";
import { checkSessionViability } from "@/lib/exercise-recipe/viability";
import {
  composeBuildASentenceRecipe,
  resolveBuildASentenceRecipe,
} from "@/lib/exercise-recipe/build-a-sentence";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";

describe("build-a-sentence recipe", () => {
  it("builds a batch of type-with-word and reveal-answer loops without prepare", () => {
    const deck = loadMeaningRecallDeck("es");
    if (deck.status !== "ok") throw new Error("missing es deck");

    const recipe = composeBuildASentenceRecipe(deck.deck.cards, {
      methodId: "build-a-sentence",
      budgetMinutes: 8,
    });

    expect(recipe?.methodId).toBe("build-a-sentence");
    expect(recipe?.steps[0]?.component).toBe("type-with-word");
    expect(recipe?.steps.some((step) => step.component === "checklist")).toBe(false);
    expect(countLearningUnits(recipe!)).toBeGreaterThanOrEqual(3);
    expect(checkSessionViability(recipe!).failures).not.toContain("G2");
    expect(checkSessionViability(recipe!).failures).not.toContain("G3");
  });

  it("resolves from the shipped pool with budget scaling", async () => {
    const recipe = await resolveBuildASentenceRecipe({
      methodId: "build-a-sentence",
      budgetMinutes: 15,
    });
    expect(recipe?.methodId).toBe("build-a-sentence");
    expect(recipe?.steps.filter((step) => step.component === "type-with-word").length).toBe(5);
  });
});

describe("resolveExerciseRecipe build-a-sentence", () => {
  it("returns a batch recipe without a prepare checklist", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence", { budgetMinutes: 8 });
    expect(recipe?.methodId).toBe("build-a-sentence");
    expect(recipe?.steps[0]?.component).toBe("type-with-word");
  });
});
