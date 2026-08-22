/**
 * Contract: docs/specs/service/content-adaptation.md (T-CI5)
 */
import { describe, expect, it } from "vitest";

import { createMemoryAdaptationCache } from "@/lib/adaptation-cache";
import { buildPersonalAdaptationCacheKey } from "@/lib/content-adaptation";
import { hashHeldLemmaSet, hashSourceText } from "@/lib/adaptation-hash";
import {
  resolveLearnerShownBody,
  resolveSourceShownBody,
} from "@/lib/adaptation-shown-body";
import type { Source } from "@/lib/coverage";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

describe("resolveLearnerShownBody", () => {
  const lexicon = loadLexiconForLanguage("es")!;
  const demandingOriginal =
    "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince.";
  const adaptedBody =
    "Uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco.";

  const learnerSource: Source = {
    id: "learner-upload-1",
    languageCode: "es",
    kind: "text",
    title: "My paste",
    origin: "learner",
    body: demandingOriginal,
    addedAt: "2026-08-22T00:00:00.000Z",
  };

  it("shows original only when processing consent is missing", () => {
    const held = new Set(["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"]);
    const sourceHash = hashSourceText(demandingOriginal);
    const heldHash = hashHeldLemmaSet(held);
    const cache = createMemoryAdaptationCache([
      {
        cacheKey: buildPersonalAdaptationCacheKey({
          sourceHash,
          heldLemmaSetHash: heldHash,
          languageCode: "es",
          targetLevel: "A2",
          promptVersion: "v1",
        }),
        sourceId: sourceHash,
        languageCode: "es",
        targetLevel: "A2",
        tier: "T3",
        promptVersion: "v1",
        adaptedBody,
        coveragePercent: 96,
        cachedAt: "2026-08-22T00:00:00.000Z",
      },
    ]);

    const shown = resolveLearnerShownBody(learnerSource, lexicon, held, cache, false);
    expect(shown.adapted).toBe(false);
    expect(shown.body).toBe(demandingOriginal);
  });

  it("offers cached T3 body when consent was granted", () => {
    const held = new Set(["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"]);
    const sourceHash = hashSourceText(demandingOriginal);
    const heldHash = hashHeldLemmaSet(held);
    const cache = createMemoryAdaptationCache([
      {
        cacheKey: buildPersonalAdaptationCacheKey({
          sourceHash,
          heldLemmaSetHash: heldHash,
          languageCode: "es",
          targetLevel: "A2",
          promptVersion: "v1",
        }),
        sourceId: sourceHash,
        languageCode: "es",
        targetLevel: "A2",
        tier: "T3",
        promptVersion: "v1",
        adaptedBody,
        coveragePercent: 96,
        cachedAt: "2026-08-22T00:00:00.000Z",
      },
    ]);

    const shown = resolveLearnerShownBody(learnerSource, lexicon, held, cache, true);
    expect(shown.adapted).toBe(true);
    expect(shown.body).toBe(adaptedBody);
    expect(shown.adaptationLabel).toContain("A2");
  });
});

describe("resolveSourceShownBody", () => {
  const lexicon = loadLexiconForLanguage("es")!;

  it("routes learner sources through the personal cache path", () => {
    const held = new Set(["uno", "dos", "tres"]);
    const learnerSource: Source = {
      id: "learner-2",
      languageCode: "es",
      kind: "text",
      title: "Paste",
      origin: "learner",
      body: "Uno dos tres.",
      addedAt: "2026-08-22T00:00:00.000Z",
    };

    const shown = resolveSourceShownBody(
      learnerSource,
      lexicon,
      held,
      createMemoryAdaptationCache(),
      createMemoryAdaptationCache(),
      false,
    );

    expect(shown.adapted).toBe(false);
    expect(shown.body).toBe("Uno dos tres.");
  });
});
