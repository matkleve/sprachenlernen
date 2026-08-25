/**
 * Contract: docs/specs/service/exercise-recipe-composer.methods.md
 */
import { describe, expect, it } from "vitest";

import {
  composeFreeProductionRecipe,
  resolveFreeProductionRecipe,
} from "@/lib/exercise-recipe/free-production";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";

describe("free-production recipe", () => {
  it("builds checklist, timed-write, capture, feedback, and summary close", () => {
    const deck = loadMeaningRecallDeck("es");
    if (deck.status !== "ok") throw new Error("missing es deck");

    const recipe = composeFreeProductionRecipe(deck.deck.cards, {
      methodId: "free-production",
      heldLemmas: new Set(["casa"]),
      durationSec: 900,
    });

    expect(recipe.methodId).toBe("free-production");
    expect(recipe.steps.map((step) => step.component)).toEqual([
      "checklist",
      "timed-write",
      "capture",
      "feedback",
      "summary",
    ]);
    expect(recipe.steps[1]?.config.durationSec).toBe(900);
    expect(recipe.steps[0]?.config.introKey).toBe("introFreeProduction");
    expect(recipe.steps[1]?.config.promptKey).toBeTruthy();
  });

  it("resolves from the shipped pool", async () => {
    const recipe = await resolveFreeProductionRecipe({ methodId: "free-production" });
    expect(recipe?.methodId).toBe("free-production");
    expect(recipe?.steps).toHaveLength(5);
  });
});

describe("resolveExerciseRecipe free-production", () => {
  it("returns a recipe for free-production", async () => {
    const recipe = await resolveExerciseRecipe("free-production");
    expect(recipe?.methodId).toBe("free-production");
    expect(recipe?.steps[1]?.component).toBe("timed-write");
  });
});
