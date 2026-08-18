/**
 * Contract: docs/specs/service/exercise-recipe-composer.methods.md
 */
import { describe, expect, it } from "vitest";

import { loadMeaningRecallDeck } from "@/lib/starter-deck";
import {
  composeBuildASentenceRecipe,
  resolveBuildASentenceRecipe,
} from "@/lib/exercise-recipe/build-a-sentence";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";

describe("build-a-sentence recipe", () => {
  it("builds type-with-word, reveal-answer, and offers", () => {
    const deck = loadMeaningRecallDeck("es");
    if (deck.status !== "ok") throw new Error("missing es deck");

    const recipe = composeBuildASentenceRecipe(deck.deck.cards, {
      methodId: "build-a-sentence",
      heldLemmas: new Set(["casa"]),
    });

    expect(recipe?.methodId).toBe("build-a-sentence");
    expect(recipe?.steps.map((step) => step.component)).toEqual([
      "type-with-word",
      "reveal-answer",
      "offers",
    ]);
    expect(recipe?.steps[0]?.config.word).toBeTruthy();
    expect(recipe?.steps[1]?.config.gloss).toBeTruthy();
  });

  it("resolves from the shipped pool", async () => {
    const recipe = await resolveBuildASentenceRecipe({ methodId: "build-a-sentence" });
    expect(recipe?.methodId).toBe("build-a-sentence");
    expect(recipe?.steps).toHaveLength(3);
  });
});

describe("resolveExerciseRecipe build-a-sentence", () => {
  it("returns a recipe for build-a-sentence", async () => {
    const recipe = await resolveExerciseRecipe("build-a-sentence");
    expect(recipe?.methodId).toBe("build-a-sentence");
    expect(recipe?.steps[0]?.component).toBe("type-with-word");
  });
});
