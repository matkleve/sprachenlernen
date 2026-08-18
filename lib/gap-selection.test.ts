/**
 * Contract: docs/specs/service/material-unit.md (gap selection, T-MU2)
 */
import { describe, expect, it } from "vitest";

import { loadLexiconForLanguage } from "@/lib/shipped-language";
import {
  buildGapFillLine,
  formatGappedSentence,
  isAlternatingOnlyGaps,
  selectGapIndices,
} from "@/lib/gap-selection";

const lexicon = loadLexiconForLanguage("es")!;
const sentence = "El café está en la mesa.";

describe("selectGapIndices", () => {
  it("AC-3: does not gap on an alternating-only pattern across all tokens", () => {
    const tokens = lexicon.tokenise(sentence);
    const gaps = selectGapIndices(tokens, lexicon);
    expect(isAlternatingOnlyGaps(tokens.length, gaps)).toBe(false);
  });

  it("AC-3: avoids function-word-only gaps", () => {
    const tokens = lexicon.tokenise(sentence);
    const gaps = new Set(selectGapIndices(tokens, lexicon));
    for (const index of gaps) {
      const word = tokens[index]!.text;
      const resolution = lexicon.resolve(word);
      if (resolution.kind === "single") {
        expect(["det", "adp", "pron", "conj", "part"]).not.toContain(
          resolution.analysis.pos,
        );
      }
    }
  });

  it("gaps at least one content word when the sentence has content words", () => {
    const tokens = lexicon.tokenise(sentence);
    expect(selectGapIndices(tokens, lexicon).length).toBeGreaterThan(0);
  });

  it("prefers held lemmas when provided", () => {
    const tokens = lexicon.tokenise(sentence);
    const heldLemmas = new Set(["café"]);
    const gaps = selectGapIndices(tokens, lexicon, { heldLemmas });
    expect(gaps.length).toBeGreaterThan(0);
    const gappedWords = gaps.map((index) => tokens[index]!.text.toLowerCase());
    expect(gappedWords).toContain("café");
  });
});

describe("buildGapFillLine", () => {
  it("marks selected tokens as gapped and preserves visible words", () => {
    const line = buildGapFillLine(sentence, lexicon);
    expect(line.tokens.some((token) => token.gapped)).toBe(true);
    expect(line.tokens.some((token) => !token.gapped)).toBe(true);
    expect(line.tokens.some((token) => token.text === "café" && token.gapped)).toBe(true);
    expect(formatGappedSentence(line)).toContain("___");
    expect(formatGappedSentence(line)).toContain("El");
  });
});
