/**
 * Contract: docs/specs/feature/reading-surface.md
 */
import { describe, expect, it } from "vitest";

import {
  glossLineForSegments,
  sentenceBlocksForText,
  splitSentenceSpans,
} from "@/lib/readable-sentences";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";

const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 3,
  seedCoverage: 1,
  verbLemmas: 1,
  verbParadigmsComplete: 1,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { café: { noun: "m" } },
  fused: {},
  forms: { café: [["café", "noun", "sg"]] },
};

const profile = loadProfile({
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
  profile,
  parseFrequencyList("café 10\n"),
  loadLemmaTable(RAW_TABLE, "es").table!,
);

describe("splitSentenceSpans", () => {
  it("splits on sentence-ending punctuation", () => {
    expect(splitSentenceSpans("Hola. ¿Qué tal? Bien.")).toEqual(["Hola.", "¿Qué tal?", "Bien."]);
  });
});

describe("glossLineForSegments", () => {
  it("dedupes glosses case-insensitively", () => {
    const line = glossLineForSegments([
      { kind: "word", text: "café", gloss: "coffee" },
      { kind: "text", value: " " },
      { kind: "word", text: "Café", gloss: "coffee" },
    ]);
    expect(line).toBe("coffee");
  });
});

describe("sentenceBlocksForText", () => {
  it("returns one block per sentence", () => {
    const blocks = sentenceBlocksForText("Un café. Otro café.", lexicon, () => "coffee");
    expect(blocks.length).toBe(2);
    expect(blocks[0]?.segments.some((segment) => segment.kind === "word")).toBe(true);
  });
});
