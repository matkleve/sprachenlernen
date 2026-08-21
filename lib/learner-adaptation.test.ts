/**
 * Contract: docs/specs/service/content-adaptation.md (T-CI5)
 */
import { describe, expect, it, vi } from "vitest";

import { createMemoryAdaptationCache } from "@/lib/adaptation-cache";
import { buildPersonalAdaptationCacheKey } from "@/lib/content-adaptation";
import { hashHeldLemmaSet, hashSourceText } from "@/lib/adaptation-hash";
import { adaptLearnerText } from "@/lib/learner-adaptation";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  type LanguageProfile,
} from "@/lib/lexicon";

const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 5,
  seedCoverage: 1,
  verbLemmas: 1,
  verbParadigmsComplete: 1,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { uno: { noun: "m" }, dos: { noun: "m" }, tres: { noun: "m" } },
  fused: {},
  forms: {
    uno: [["uno", "num", ""]],
    dos: [["dos", "num", ""]],
    tres: [["tres", "num", ""]],
    cuatro: [["cuatro", "num", ""]],
    cinco: [["cinco", "num", ""]],
    seis: [["seis", "num", ""]],
    siete: [["siete", "num", ""]],
    ocho: [["ocho", "num", ""]],
    nueve: [["nueve", "num", ""]],
    diez: [["diez", "num", ""]],
  },
};

const profile = (): LanguageProfile =>
  loadProfile({
    code: "es",
    name: "Test",
    script: "latin",
    morphology: "fusional",
    countingUnit: "lemma",
    frequency: {
      source: "s",
      corpus: "c",
      version: "1",
      licence: "MIT",
      unit: "form",
      file: "f",
    },
  }).profile!;

const lexicon = buildLexicon(
  profile(),
  parseFrequencyList(
    "uno 100\ndos 90\ntres 80\ncuatro 70\ncinco 60\nseis 50\nsiete 40\nocho 30\nnueve 20\ndiez 10\n",
  ),
  loadLemmaTable(RAW_TABLE, "es").table!,
);

const heldComfortable = new Set(["uno", "dos", "tres", "cuatro", "cinco"]);
const heldTiny = new Set(["uno"]);

const comfortableAdaptedBody =
  "Uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco.";

const demandingOriginal =
  "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince.";

describe("adaptLearnerText", () => {
  it("returns original without rewrite when coverage is already comfortable", async () => {
    const rewrite = vi.fn(async () => "should not run");
    const result = await adaptLearnerText({
      originalBody: comfortableAdaptedBody,
      languageCode: "es",
      targetLevel: "A2",
      lexicon,
      heldLemmas: heldComfortable,
      rewrite,
      cache: createMemoryAdaptationCache(),
      processingConsent: true,
    });

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.adapted).toBe(false);
    expect(result.tier).toBe("T0");
    expect(rewrite).not.toHaveBeenCalled();
  });

  it("refuses adaptation without processing consent", async () => {
    const rewrite = vi.fn(async () => comfortableAdaptedBody);
    const result = await adaptLearnerText({
      originalBody: demandingOriginal,
      languageCode: "es",
      targetLevel: "A2",
      lexicon,
      heldLemmas: heldComfortable,
      rewrite,
      cache: createMemoryAdaptationCache(),
      processingConsent: false,
    });

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.adapted).toBe(false);
    expect(result.body).toBe(demandingOriginal);
    expect(rewrite).not.toHaveBeenCalled();
  });

  it("caches T3 output keyed by source + held-set hash", async () => {
    const rewrite = vi.fn(async () => comfortableAdaptedBody);
    const cache = createMemoryAdaptationCache();
    const sourceHash = hashSourceText(demandingOriginal);
    const heldHash = hashHeldLemmaSet(heldComfortable);

    const first = await adaptLearnerText({
      originalBody: demandingOriginal,
      languageCode: "es",
      targetLevel: "A2",
      lexicon,
      heldLemmas: heldComfortable,
      rewrite,
      cache,
      processingConsent: true,
    });
    const second = await adaptLearnerText({
      originalBody: demandingOriginal,
      languageCode: "es",
      targetLevel: "A2",
      lexicon,
      heldLemmas: heldComfortable,
      rewrite,
      cache,
      processingConsent: true,
    });

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");
    if (first.status !== "ready" || second.status !== "ready") return;
    expect(first.adapted).toBe(true);
    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(rewrite).toHaveBeenCalledTimes(1);

    const cacheKey = buildPersonalAdaptationCacheKey({
      sourceHash,
      heldLemmaSetHash: heldHash,
      languageCode: "es",
      targetLevel: "A2",
      promptVersion: "v1",
    });
    expect(cache.has(cacheKey)).toBe(true);
  });

  it("fails honestly when T3 rewrite never reaches comfortable coverage", async () => {
    const rewrite = vi.fn(async () => demandingOriginal);
    const result = await adaptLearnerText({
      originalBody: demandingOriginal,
      languageCode: "es",
      targetLevel: "A2",
      lexicon,
      heldLemmas: heldTiny,
      rewrite,
      cache: createMemoryAdaptationCache(),
      processingConsent: true,
    });

    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.reason).toMatch(/^coverage-below-min:/);
    expect(rewrite).toHaveBeenCalledTimes(2);
  });
});
