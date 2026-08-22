/**
 * Contract: docs/specs/service/content-adaptation.md (T-CI5)
 */
import { describe, expect, it, vi } from "vitest";

import { createMemoryAdaptationCache } from "@/lib/adaptation-cache";
import { buildLearnerMaterialPreview } from "@/lib/learner-adaptation-preview";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

const { catalogue } = loadMethodCatalogue();
const partialDictation = findMethod(catalogue, "partial-dictation")!;
const lexicon = loadLexiconForLanguage("es")!;
const heldComfortable = new Set(["uno", "dos", "tres", "cuatro", "cinco"]);

const labels = {
  unitLabel: (id: string) => id,
  demandingLine: (percent: number, words: number) => `demanding ${percent}% ${words}`,
  t1SupportLine: (percent: number, gaps: number) => `t1 ${percent}% ${gaps}`,
  blockedLine: (percent: number, level: string) => `blocked ${percent}% ${level}`,
  adaptationLabel: (level: string) => `Adapted for ${level}`,
  adaptationFailed: (level: string) => `failed ${level}`,
  generatedLabel: () => "Generated article",
};

const comfortableFixture = vi.fn(async () =>
  "Uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco.",
);

describe("buildLearnerMaterialPreview", () => {
  it("shows original only without processing consent", async () => {
    const preview = await buildLearnerMaterialPreview(
      "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce.",
      partialDictation,
      "sentence",
      "es",
      lexicon,
      heldComfortable,
      labels,
      {
        processingConsent: false,
        rewrite: comfortableFixture,
        cache: createMemoryAdaptationCache(),
      },
    );

    expect(preview?.adapted).toBe(false);
    expect(preview?.processingConsentRequired).toBe(true);
    expect(preview?.needsAdaptation).toBe(true);
    expect(comfortableFixture).not.toHaveBeenCalled();
  });

  it("adapts with consent and enables Start when personal coverage passes", async () => {
    const preview = await buildLearnerMaterialPreview(
      "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince.",
      partialDictation,
      "sentence",
      "es",
      lexicon,
      heldComfortable,
      labels,
      {
        processingConsent: true,
        rewrite: comfortableFixture,
        cache: createMemoryAdaptationCache(),
      },
    );

    expect(preview?.adapted).toBe(true);
    expect(preview?.startEnabled).toBe(true);
    expect(preview?.adaptationLabel).toContain("A2");
    expect(comfortableFixture).toHaveBeenCalled();
  });
});
