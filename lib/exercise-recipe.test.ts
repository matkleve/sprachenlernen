/**
 * Contract: docs/specs/feature/exercise-runner.md (T-E8 partial dictation)
 */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_PARTIAL_DICTATION_SOURCE_ID,
  dictationSentenceFromSource,
  findContentSourceById,
  gappedSentence,
  pickDictationSentence,
} from "@/lib/content-sources";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import {
  buildPartialDictationRecipe,
  resolvePartialDictationRecipe,
} from "@/lib/exercise-recipe/partial-dictation";

describe("content-sources dictation helpers", () => {
  it("picks a substantial sentence from fixture café body", () => {
    const source = findContentSourceById("es-fixture-cafe");
    expect(source).not.toBeNull();
    expect(dictationSentenceFromSource(source!)).toBe("El café está en la mesa.");
  });

  it("gaps every second word", () => {
    expect(gappedSentence("El café está en la mesa.")).toBe(
      "El ___ está ___ la ___.",
    );
  });

  it("skips one-word fragments when picking", () => {
    expect(pickDictationSentence("Uno dos tres. El café está en la mesa.")).toBe(
      "El café está en la mesa.",
    );
  });
});

describe("partial dictation recipe", () => {
  it("builds six steps from a catalogue source", () => {
    const source = findContentSourceById(DEFAULT_PARTIAL_DICTATION_SOURCE_ID)!;
    const recipe = buildPartialDictationRecipe(source);

    expect(recipe.methodId).toBe("partial-dictation");
    expect(recipe.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
    expect(recipe.steps).toHaveLength(6);

    const review = recipe.steps.find((step) => step.type === "review");
    expect(review?.config.answerKey).toBe("El café está en la mesa.");

    const doStep = recipe.steps.find((step) => step.type === "do");
    expect(doStep?.config.body).toContain("___");
    expect(doStep?.config.body).toContain("está");
  });

  it("defaults to es-fixture-cafe without sourceId", () => {
    const recipe = resolvePartialDictationRecipe();
    expect(recipe?.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
  });

  it("returns null for unknown sourceId", () => {
    expect(resolvePartialDictationRecipe("missing-source")).toBeNull();
  });
});

describe("resolveExerciseRecipe", () => {
  it("returns catalogue recipe for partial-dictation", () => {
    const recipe = resolveExerciseRecipe("partial-dictation");
    expect(recipe?.methodId).toBe("partial-dictation");
    expect(recipe?.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
    expect(recipe?.steps).toHaveLength(6);
  });

  it("uses requested catalogue source when sourceId is set", () => {
    const recipe = resolveExerciseRecipe(
      "partial-dictation",
      "es-catalogue-chile",
    );
    expect(recipe?.sourceId).toBe("es-catalogue-chile");
    const review = recipe?.steps.find((step) => step.type === "review");
    expect(review?.config.answerKey).toContain("gobierno");
  });

  it("returns null for unbuilt methods", () => {
    expect(resolveExerciseRecipe("full-dictation")).toBeNull();
  });
});
