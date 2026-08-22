/**
 * Contract: docs/specs/service/content-adaptation.md (T-CI4)
 */
import { describe, expect, it } from "vitest";

import { createMemoryAdaptationCache } from "@/lib/adaptation-cache";
import { buildAdaptationCacheKey } from "@/lib/content-adaptation";
import { resolveCatalogueShownBody } from "@/lib/adaptation-preview";
import type { Source } from "@/lib/coverage";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

const wikinews: Source = {
  id: "wikinews-es-3516",
  languageCode: "es",
  kind: "text",
  title: "Egypt elections",
  origin: "catalogue",
  body: "Un texto muy largo con muchas palabras desconocidas para el aprendiz principiante.",
  sourceUrl: "https://example.com/original",
  addedAt: "2026-08-20T00:00:00.000Z",
};

describe("resolveCatalogueShownBody", () => {
  const lexicon = loadLexiconForLanguage("es")!;

  it("offers cached adapted body and applies personal delivery gate", () => {
    const adaptedBody =
      "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince.";
    const cacheKey = buildAdaptationCacheKey({
      sourceId: wikinews.id,
      languageCode: "es",
      targetLevel: "A2",
      tier: "T2",
      promptVersion: "v1",
    });
    const cache = createMemoryAdaptationCache([
      {
        cacheKey,
        sourceId: wikinews.id,
        languageCode: "es",
        targetLevel: "A2",
        tier: "T2",
        promptVersion: "v1",
        adaptedBody,
        coveragePercent: 96,
        cachedAt: "2026-08-20T00:00:00.000Z",
      },
    ]);
    const held = new Set(["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"]);

    const shown = resolveCatalogueShownBody(wikinews, lexicon, held, cache);
    expect(shown.adapted).toBe(true);
    expect(shown.body).toBe(adaptedBody);
    expect(shown.adaptationLabel).toContain("A2");
    expect(shown.sourceUrl).toBe("https://example.com/original");
  });
});
