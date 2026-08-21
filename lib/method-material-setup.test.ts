/**
 * Contract: docs/specs/feature/method-material-setup.md
 */
import { describe, expect, it } from "vitest";

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
    expect(environment?.disabled).toBe(true);
    expect(environment?.emptyReason).toBe(labels.emptyTopic);
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
    expect(newsPreview?.title).toContain("Chile");
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
      sourceId: "es-catalogue-chile",
      topicId: "news",
      unitId: "sentence",
    });
    expect(href).toContain("method=partial-dictation");
    expect(href).toContain("sourceId=es-catalogue-chile");
    expect(href).toContain("topicId=news");
    expect(href).toContain("unitId=sentence");
    expect(href).toContain("variantId=short");
  });

  it("maps paragraph unit to standard variant", () => {
    const href = practiceHrefForSetup({
      methodId: "partial-dictation",
      sourceId: "es-catalogue-chile",
      topicId: "news",
      unitId: "paragraph",
    });
    expect(href).toContain("variantId=standard");
  });

  it("maps window unit to long variant", () => {
    const href = practiceHrefForSetup({
      methodId: "partial-dictation",
      sourceId: "es-catalogue-chile",
      topicId: "news",
      unitId: "window",
      durationSec: 300,
    });
    expect(href).toContain("variantId=long");
    expect(href).toContain("durationSec=300");
  });
});

describe("pickTopicSource", () => {
  it("prefers the best coverage source for a topic tag", () => {
    const source = pickTopicSource(sources, "news", lexicon, held);
    expect(source?.id).toBe("es-catalogue-chile");
  });
});
