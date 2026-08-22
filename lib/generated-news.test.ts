import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/coverage";
import { loadLexiconForLanguage } from "@/lib/shipped-language";
import { loadContentSources } from "@/lib/content-sources";
import {
  isGeneratedCatalogueSource,
  isLicenceClearedCatalogueSource,
  pickTopicSourceWithLaneFallback,
} from "@/lib/generated-news";
import { pickTopicSource } from "@/lib/material-source-pick";

const lexicon = loadLexiconForLanguage("es")!;
const held = new Set(["uno", "dos", "tres", "cuatro", "cinco", "el", "la", "casa", "de"]);
const sources = loadContentSources("es");

const generatedEnvironment: Source = {
  id: "generated-news-es-environment-2026-08",
  languageCode: "es",
  kind: "text",
  title: "Europa registra un verano con temperaturas altas",
  origin: "catalogue",
  generated: true,
  body: "En agosto muchas ciudades registraron temperaturas altas. Los expertos señalan cambios en el clima.",
  tags: ["environment"],
  addedAt: "2026-08-22T12:00:00.000Z",
  licence: { kind: "generated", fetchedAt: "2026-08-22T12:00:00.000Z" },
};

describe("generated-news · lane detection", () => {
  it("marks wikinews as licence-cleared catalogue", () => {
    const wikinews = sources.find((source) => source.id === "wikinews-es-3516");
    expect(wikinews).toBeDefined();
    expect(isLicenceClearedCatalogueSource(wikinews!)).toBe(true);
    expect(isGeneratedCatalogueSource(wikinews!)).toBe(false);
  });

  it("marks generated catalogue rows", () => {
    expect(isGeneratedCatalogueSource(generatedEnvironment)).toBe(true);
    expect(isLicenceClearedCatalogueSource(generatedEnvironment)).toBe(false);
  });
});

describe("pickTopicSourceWithLaneFallback", () => {
  it("prefers licence-cleared news over generated when both exist", () => {
    const mixed = [
      generatedEnvironment,
      ...sources.filter((source) => source.tags?.includes("news")),
    ];
    const picked = pickTopicSourceWithLaneFallback(mixed, "news", lexicon, held);
    expect(picked?.id).toBe("wikinews-es-3516");
  });

  it("falls back to generated when no licence-cleared source exists for the topic", () => {
    const picked = pickTopicSourceWithLaneFallback(
      [generatedEnvironment, ...sources],
      "environment",
      lexicon,
      held,
    );
    expect(picked?.id).toBe(generatedEnvironment.id);
  });

  it("matches pickTopicSource when only licence-cleared catalogue exists", () => {
    const newsOnly = sources.filter(
      (source) => source.tags?.includes("news") || source.origin === "fixture",
    );
    expect(pickTopicSourceWithLaneFallback(newsOnly, "news", lexicon, held)?.id).toBe(
      pickTopicSource(newsOnly, "news", lexicon, held)?.id,
    );
  });
});
