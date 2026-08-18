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
import { loadLexiconForLanguage } from "@/lib/shipped-language";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import {
  buildPartialDictationRecipe,
  composePartialDictationRecipe,
  resolvePartialDictationRecipe,
} from "@/lib/exercise-recipe/partial-dictation";

describe("content-sources dictation helpers", () => {
  it("picks a substantial sentence from fixture café body", () => {
    const source = findContentSourceById("es-fixture-cafe");
    expect(source).not.toBeNull();
    expect(dictationSentenceFromSource(source!)).toBe("El café está en la mesa.");
  });

  it("gaps content words with lexicon — not alternating-only", () => {
    const lexicon = loadLexiconForLanguage("es")!;
    const gapped = gappedSentence("El café está en la mesa.", lexicon);
    expect(gapped).toContain("___");
    expect(gapped).not.toBe("El ___ está ___ la ___.");
  });

  it("skips one-word fragments when picking", () => {
    expect(pickDictationSentence("Uno dos tres. El café está en la mesa.")).toBe(
      "El café está en la mesa.",
    );
  });
});

describe("partial dictation recipe", () => {
  const catalogueOnly = (id: string) => findContentSourceById(id);

  it("builds six steps from a catalogue source", () => {
    const source = findContentSourceById(DEFAULT_PARTIAL_DICTATION_SOURCE_ID)!;
    const recipe = buildPartialDictationRecipe(source);

    expect(recipe.methodId).toBe("partial-dictation");
    expect(recipe.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
    expect(recipe.steps).toHaveLength(6);

    const review = recipe.steps.find((step) => step.type === "review");
    expect(review?.config.answerKey).toBe("El café está en la mesa.");

    const doStep = recipe.steps.find((step) => step.type === "do");
    expect(doStep?.component).toBe("gap-fill");
    expect(doStep?.config.sentence).toBe("El café está en la mesa.");
    expect(Array.isArray(doStep?.config.tokens)).toBe(true);
    const tokens = doStep?.config.tokens as Array<{ gapped: boolean }>;
    expect(tokens.some((token) => token.gapped)).toBe(true);
  });

  it("defaults to es-fixture-cafe without sourceId", async () => {
    const recipe = await resolvePartialDictationRecipe(
      { methodId: "partial-dictation" },
      catalogueOnly,
    );
    expect(recipe?.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
  });

  it("returns null for unknown sourceId", async () => {
    expect(
      await resolvePartialDictationRecipe(
        { methodId: "partial-dictation", sourceId: "missing-source" },
        catalogueOnly,
      ),
    ).toBeNull();
  });

  it("standard variant adds multiple dictation loops when source has enough sentences", () => {
    const source = findContentSourceById(DEFAULT_PARTIAL_DICTATION_SOURCE_ID)!;
    const recipe = composePartialDictationRecipe(source, {
      methodId: "partial-dictation",
      variantId: "standard",
    });
    const doSteps = recipe.steps.filter((step) => step.type === "do");
    expect(doSteps.length).toBeGreaterThan(1);
    expect(recipe.steps.length).toBeGreaterThan(6);
  });
});

describe("resolveExerciseRecipe", () => {
  it("returns catalogue recipe for partial-dictation", async () => {
    const recipe = await resolveExerciseRecipe("partial-dictation");
    expect(recipe?.methodId).toBe("partial-dictation");
    expect(recipe?.sourceId).toBe(DEFAULT_PARTIAL_DICTATION_SOURCE_ID);
    expect(recipe?.steps).toHaveLength(6);
  });

  it("uses requested catalogue source when sourceId is set", async () => {
    const recipe = await resolveExerciseRecipe(
      "partial-dictation",
      "es-catalogue-chile",
    );
    expect(recipe?.sourceId).toBe("es-catalogue-chile");
    const review = recipe?.steps.find((step) => step.type === "review");
    expect(review?.config.answerKey).toContain("gobierno");
  });

  it("returns null for unbuilt methods", async () => {
    expect(await resolveExerciseRecipe("full-dictation")).toBeNull();
  });
});
