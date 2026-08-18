/**
 * Contract: docs/specs/feature/reading-surface.md
 */
import { describe, expect, it } from "vitest";

import { segmentsForReadableText } from "@/lib/readable-text";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  type LanguageProfile,
} from "@/lib/lexicon";

const LIST = "uno 100\ndos 90\ncasa 80\n";

const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 3,
  seedCoverage: 1,
  verbLemmas: 0,
  verbParadigmsComplete: 0,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { casa: { noun: "f" } },
  fused: {},
  forms: {
    uno: [["uno", "num", ""]],
    dos: [["dos", "num", ""]],
    casa: [["casa", "noun", "sg"]],
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

const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), loadLemmaTable(RAW_TABLE, "es").table!);

describe("segmentsForReadableText", () => {
  it("preserves punctuation between words", () => {
    const segments = segmentsForReadableText("Uno dos.", lex(), () => "");
    expect(segments.map((s) => (s.kind === "text" ? s.value : s.text))).toEqual(["Uno", " ", "dos", "."]);
  });

  it("attaches pool gloss to resolved lemmas", () => {
    const segments = segmentsForReadableText("casa", lex(), (lemma) =>
      lemma === "casa" ? "house" : "",
    );
    const word = segments.find((s) => s.kind === "word");
    expect(word?.kind === "word" && word.gloss).toBe("house");
  });
});
