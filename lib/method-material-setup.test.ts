/**
 * Contract: docs/specs/feature/method-material-setup.md
 */
import { describe, expect, it } from "vitest";

import { createMemoryAdaptationCache } from "@/lib/adaptation-cache";
import { buildAdaptationCacheKey } from "@/lib/content-adaptation";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { loadLexiconForLanguage } from "@/lib/shipped-language";
import { loadContentSources } from "@/lib/content-sources";
import {
  APP_PICK_TOPIC_ID,
  OWN_TOPIC_ID,
  buildMaterialSetupContext,
  createLearnerSourceFromText,
  hasMaterialSetup,
  pickAppPickSource,
  pickTopicSource,
  pickTopicSourceWithLaneFallback,
  practiceHrefForSetup,
  previewForOwnText,
  topicChipsForMethod,
} from "@/lib/method-material-setup";

const { catalogue } = loadMethodCatalogue();
const extensiveReading = findMethod(catalogue, "extensive-reading")!;
const readingAloud = findMethod(catalogue, "reading-aloud")!;
const partialDictation = findMethod(catalogue, "partial-dictation")!;
const srsSession = findMethod(catalogue, "srs-session")!;

const lexicon = loadLexiconForLanguage("es")!;
const sources = loadContentSources("es");
const held = new Set(["uno", "dos", "tres", "cuatro", "cinco", "el", "la", "casa", "de"]);

const labels = {
  appPick: "App picks",
  own: "Your own",
  topicLabel: (key: string) => key,
  unitLabel: (id: string) => id,
  comfortBand: (band: string) => band,
  coverageLine: (percent: number, band: string) => `${percent}% · ${band}`,
  demandingLine: (percent: number, words: number) => `demanding ${percent}% ${words}`,
  t1SupportLine: (percent: number, gaps: number) => `t1 ${percent}% ${gaps}`,
  blockedLine: (percent: number, level: string) => `blocked ${percent}% ${level}`,
  adaptationLabel: (level: string) => `Adapted for ${level}`,
  generatedLabel: () => "Generated article",
  adaptationFailed: (level: string) => `failed ${level}`,
  processingConsent: "Adapt",
  processingConsentHint: "Cloud processing",
  appPickPreview: (percent: number, band: string) => `~${percent}% ${band}`,
  emptyTopic: "Nothing yet",
  keepInLibrary: "Keep",
  uploadFile: "Upload",
  pasteText: "Paste",
  pastePlaceholder: "Paste here",
  linkUrl: "Link",
};

describe("hasMaterialSetup", () => {
  it("AC-2: srs-session has no material setup", () => {
    expect(hasMaterialSetup(srsSession)).toBe(false);
  });

  it("AC-1: extensive-reading declares material setup", () => {
    expect(hasMaterialSetup(extensiveReading)).toBe(true);
  });

  it("AC-1: reading-aloud declares material setup", () => {
    expect(hasMaterialSetup(readingAloud)).toBe(true);
  });
});

describe("topicChipsForMethod", () => {
  it("AC-1: includes app-pick, declared topics, and own", () => {
    const chips = topicChipsForMethod(extensiveReading, sources, labels);
    expect(chips.map((chip) => chip.id)).toEqual([
      APP_PICK_TOPIC_ID,
      "news",
      "daily",
      OWN_TOPIC_ID,
    ]);
  });

  it("AC-6: disables catalogue topic chips with zero sources", () => {
    const chips = topicChipsForMethod(partialDictation, sources, labels);
    const environment = chips.find((chip) => chip.id === "environment");
    expect(environment?.disabled).toBe(false);
  });
});

describe("pickAppPickSource", () => {
  it("prefilters app-pick sources by activeWorld before coverage ranking", () => {
    const politicsPick = pickAppPickSource(sources, lexicon, held, "politics");
    expect(["es-catalogue-chile", "es-fixture-neutral"]).toContain(politicsPick?.id);
    expect(politicsPick?.id).not.toBe("es-fixture-cafe");

    const everydayPick = pickAppPickSource(sources, lexicon, held, "everyday");
    expect(["es-fixture-cafe", "es-fixture-neutral"]).toContain(everydayPick?.id);
    expect(everydayPick?.id).not.toBe("es-catalogue-chile");

    const businessPick = pickAppPickSource(sources, lexicon, held, "business");
    expect(businessPick?.id).toBe("es-fixture-neutral");
  });
});

describe("buildMaterialSetupContext", () => {
  it("AC-3: news topic resolves a catalogue preview with coverage", () => {
    const context = buildMaterialSetupContext(
      partialDictation,
      sources,
      lexicon,
      held,
      labels,
    )!;
    const newsPreview = context.previews.news?.sentence;
    expect(newsPreview?.title).toContain("elecciones");
    expect(newsPreview?.coverage.coveragePercent).toBeGreaterThan(0);
  });

  it("AC-8: partial dictation exposes sentence, paragraph, and window unit previews", () => {
    const context = buildMaterialSetupContext(
      partialDictation,
      sources,
      lexicon,
      held,
      labels,
    )!;
    expect(context.unitOptions.map((unit) => unit.id)).toEqual(["sentence", "paragraph", "window"]);
    expect(context.previews[APP_PICK_TOPIC_ID]?.sentence?.unitLabel).toBe("sentence");
    expect(context.previews[APP_PICK_TOPIC_ID]?.paragraph?.unitLabel).toBe("paragraph");
    expect(context.previews[APP_PICK_TOPIC_ID]?.window?.unitLabel).toBe("window");
  });
});

describe("previewForOwnText", () => {
  it("AC-5: pasted text below comfortable band gets demanding copy", () => {
    const preview = previewForOwnText(
      "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce.",
      partialDictation,
      "sentence",
      "es",
      lexicon,
      new Set(["uno"]),
      labels,
    );
    expect(preview?.coverage.comfortBand).toBe("demanding");
    expect(preview?.demandingCopy).toContain("demanding");
  });
});

describe("createLearnerSourceFromText", () => {
  it("AC-7: unchecked keep uses ephemeral learner source (no library id)", () => {
    const source = createLearnerSourceFromText("Hola mundo.", "es");
    expect(source.origin).toBe("learner");
    expect(source.ephemeral).toBe(true);
    expect(source.id.startsWith("learner-")).toBe(true);
  });
});

describe("practiceHrefForSetup", () => {
  it("passes method, source, topic, unit, and variant on Start", () => {
    const href = practiceHrefForSetup({
      methodId: "partial-dictation",
      sourceId: "wikinews-es-3516",
      topicId: "news",
      unitId: "sentence",
    });
    expect(href).toContain("method=partial-dictation");
    expect(href).toContain("sourceId=wikinews-es-3516");
    expect(href).toContain("topicId=news");
    expect(href).toContain("unitId=sentence");
    expect(href).toContain("variantId=short");
  });

  it("maps paragraph unit to standard variant", () => {
    const href = practiceHrefForSetup({
      methodId: "partial-dictation",
      sourceId: "wikinews-es-3516",
      topicId: "news",
      unitId: "paragraph",
    });
    expect(href).toContain("variantId=standard");
  });

  it("maps window unit to long variant", () => {
    const href = practiceHrefForSetup({
      methodId: "partial-dictation",
      sourceId: "wikinews-es-3516",
      topicId: "news",
      unitId: "window",
      durationSec: 300,
    });
    expect(href).toContain("variantId=long");
    expect(href).toContain("durationSec=300");
  });
});

describe("adaptation delivery gate previews", () => {
  const newsSource = sources.find((source) => source.id === "wikinews-es-3516")!;
  const comfortableBody =
    "Uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco uno dos tres cuatro cinco.";
  const cache = createMemoryAdaptationCache([
    {
      cacheKey: buildAdaptationCacheKey({
        sourceId: newsSource.id,
        languageCode: "es",
        targetLevel: "A2",
        tier: "T2",
        promptVersion: "v1",
      }),
      sourceId: newsSource.id,
      languageCode: "es",
      targetLevel: "A2",
      tier: "T2",
      promptVersion: "v1",
      adaptedBody: comfortableBody,
      coveragePercent: 96,
      cachedAt: "2026-08-20T00:00:00.000Z",
    },
  ]);

  it("AC-7: adapted preview with personal coverage ≥ 95 % enables Start", () => {
    const heldComfortable = new Set(["uno", "dos", "tres", "cuatro", "cinco"]);
    const context = buildMaterialSetupContext(
      extensiveReading,
      sources,
      lexicon,
      heldComfortable,
      labels,
      { cache },
    )!;
    const preview = context.previews.news?.full;
    expect(preview?.adapted).toBe(true);
    expect(preview?.coverage.coveragePercent).toBeGreaterThanOrEqual(95);
    expect(preview?.startEnabled).toBe(true);
    expect(preview?.deliveryGate).toBe("comfortable");
    expect(preview?.adaptationLabel).toContain("A2");
  });

  it("AC-10: adapted preview with personal coverage < 80 % blocks Start", () => {
    const heldTiny = new Set(["uno"]);
    const context = buildMaterialSetupContext(
      extensiveReading,
      sources,
      lexicon,
      heldTiny,
      labels,
      { cache },
    )!;
    const preview = context.previews.news?.full;
    expect(preview?.adapted).toBe(true);
    expect(preview?.coverage.coveragePercent).toBeLessThan(80);
    expect(preview?.startEnabled).toBe(false);
    expect(preview?.deliveryGate).toBe("blocked");
    expect(preview?.demandingCopy).toContain("blocked");
  });

  it("AC-8: adapted preview with personal coverage 80–94 % keeps Start with T1 copy", () => {
    const heldMid = new Set(["uno", "dos", "tres", "cuatro"]);
    const context = buildMaterialSetupContext(
      extensiveReading,
      sources,
      lexicon,
      heldMid,
      labels,
      { cache },
    )!;
    const preview = context.previews.news?.full;
    expect(preview?.adapted).toBe(true);
    expect(preview?.coverage.coveragePercent).toBeGreaterThanOrEqual(80);
    expect(preview?.coverage.coveragePercent).toBeLessThan(95);
    expect(preview?.startEnabled).toBe(true);
    expect(preview?.deliveryGate).toBe("t1-support");
    expect(preview?.demandingCopy).toContain("t1");
  });
});

describe("pickTopicSource", () => {
  it("prefers the best coverage source for a topic tag", () => {
    const source = pickTopicSource(sources, "news", lexicon, held);
    expect(source?.id).toBe("wikinews-es-3516");
  });

  it("includes partner-tos sources in the catalogue pool", () => {
    const partner = sources.find((source) => source.id === "partner-dw-es-lgsn-2026-08");
    expect(partner?.licence?.kind).toBe("partner-tos");
    expect(partner?.tags).toContain("politics");
  });

  it("falls back to generated lane C for environment when only generated exists", () => {
    const source = pickTopicSourceWithLaneFallback(sources, "environment", lexicon, held);
    expect(source?.id).toBe("generated-news-es-environment-2026-08");
  });
});
