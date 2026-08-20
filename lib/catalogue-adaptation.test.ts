/**
 * Contract: docs/specs/service/content-adaptation.md (T-CI3)
 */
import { describe, expect, it, vi } from "vitest";

import { createMemoryAdaptationCache } from "@/lib/adaptation-cache";
import { adaptCatalogueSource } from "@/lib/catalogue-adaptation";
import type { Source } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  type LanguageProfile,
} from "@/lib/lexicon";
import { inferTargetLevelFromHeldCount } from "@/lib/target-level";

const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 5,
  seedCoverage: 1,
  verbLemmas: 1,
  verbParadigmsComplete: 1,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { gobierno: { noun: "m" }, economía: { noun: "f" }, crecer: { verb: "1" } },
  fused: {},
  forms: {
    el: [["el", "det", ""]],
    gobierno: [["gobierno", "noun", "sg"]],
    anuncia: [["anunciar", "verb", "ind.pres.3sg"]],
    nuevas: [["nuevo", "adj", "f.pl"]],
    medidas: [["medida", "noun", "pl"]],
    la: [["la", "det", ""]],
    economía: [["economía", "noun", "sg"]],
    crece: [["crecer", "verb", "ind.pres.3sg"]],
    este: [["este", "det", ""]],
    año: [["año", "noun", "sg"]],
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
    "el 100\ngobierno 90\nanunciar 80\nnuevo 70\nmedida 60\nla 100\neconomía 90\ncrecer 80\neste 70\naño 60\n",
  ),
  loadLemmaTable(RAW_TABLE, "es").table!,
);

const held = new Set(["el", "la", "gobierno", "anunciar", "nuevo", "medida", "economía", "crecer", "este", "año"]);

const demandingSource: Source = {
  id: "wikinews-es-test",
  languageCode: "es",
  kind: "text",
  title: "Noticias duras",
  origin: "catalogue",
  body: "Texto desconocido con palabras raras que nadie conoce todavía en este fixture.",
  addedAt: "2026-08-20T00:00:00.000Z",
  licence: {
    kind: "cc-by",
    attribution: "Test",
    fetchedAt: "2026-08-20T00:00:00.000Z",
  },
};

const comfortableSource: Source = {
  id: "es-comfortable",
  languageCode: "es",
  kind: "text",
  title: "Economía",
  origin: "catalogue",
  body: "El gobierno anuncia nuevas medidas. La economía crece este año.",
  addedAt: "2026-08-20T00:00:00.000Z",
  licence: {
    kind: "cc-by",
    attribution: "Test",
    fetchedAt: "2026-08-20T00:00:00.000Z",
  },
};

describe("inferTargetLevelFromHeldCount", () => {
  it("maps small pools to A2 and larger pools to B1", () => {
    expect(inferTargetLevelFromHeldCount(400)).toBe("A2");
    expect(inferTargetLevelFromHeldCount(2000)).toBe("B1");
  });
});

describe("adaptCatalogueSource", () => {
  it("returns T0 without rewrite when original coverage is already comfortable", async () => {
    const rewrite = vi.fn(async () => "should not run");
    const result = await adaptCatalogueSource({
      source: comfortableSource,
      targetLevel: "A2",
      lexicon,
      heldLemmas: held,
      rewrite,
      cache: createMemoryAdaptationCache(),
    });

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.adapted).toBe(false);
    expect(result.tier).toBe("T0");
    expect(rewrite).not.toHaveBeenCalled();
  });

  it("caches T2 output and skips rewrite on the second call", async () => {
    const rewrite = vi.fn(async () => comfortableSource.body!);
    const cache = createMemoryAdaptationCache();

    const first = await adaptCatalogueSource({
      source: demandingSource,
      targetLevel: "A2",
      lexicon,
      heldLemmas: held,
      rewrite,
      cache,
    });
    const second = await adaptCatalogueSource({
      source: demandingSource,
      targetLevel: "A2",
      lexicon,
      heldLemmas: held,
      rewrite,
      cache,
    });

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");
    if (first.status !== "ready" || second.status !== "ready") return;
    expect(first.fromCache).toBe(false);
    expect(first.adapted).toBe(true);
    expect(second.fromCache).toBe(true);
    expect(rewrite).toHaveBeenCalledTimes(1);
  });

  it("fails honestly when rewrite never reaches comfortable coverage", async () => {
    const rewrite = vi.fn(async () => demandingSource.body!);
    const result = await adaptCatalogueSource({
      source: demandingSource,
      targetLevel: "A2",
      lexicon,
      heldLemmas: held,
      rewrite,
      cache: createMemoryAdaptationCache(),
    });

    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.reason).toMatch(/^coverage-below-min:/);
    expect(rewrite).toHaveBeenCalledTimes(2);
  });
});
