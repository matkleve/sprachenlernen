/**
 * Contract: docs/specs/feature/content-gap.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { computeCoverage, loadSources } from "@/lib/coverage";
import {
  computeGapSet,
  estimateGapPace,
  GAP_LIST_CAP,
  pickAlternateSource,
} from "@/lib/content-gap";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";

const ROOT = join(__dirname, "..");
const readData = (path: string) => readFileSync(join(ROOT, path), "utf8");

const esLexicon = () => {
  const profile = loadProfile(JSON.parse(readData("data/languages/es.json"))).profile!;
  const table = loadLemmaTable(JSON.parse(readData("data/lemma/es.json")), "es").table!;
  return buildLexicon(profile, parseFrequencyList(readData("data/frequency/es.txt")), table);
};

describe("content-gap", () => {
  it("lists gap lemmas in frequency order for a demanding source", () => {
    const lexicon = esLexicon();
    const held = new Set(["uno", "dos", "tres", "cuatro", "cinco"]);
    const text =
      "uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince";

    const gap = computeGapSet(text, lexicon, held, {
      glossForLemma: (lemma) => `gloss:${lemma}`,
    });

    expect(gap.kind).toBe("list");
    if (gap.kind !== "list") return;

    expect(gap.gapCount).toBeGreaterThan(0);
    expect(gap.lemmas[0]?.lemma).toBe("seis");
    expect(gap.lemmas.map((lemma) => lemma.frequencyRank)).toEqual(
      [...gap.lemmas].map((lemma) => lemma.frequencyRank).sort((a, b) => a - b),
    );
  });

  it("returns none when coverage is already comfortable", () => {
    const lexicon = esLexicon();
    const text = "uno dos tres";
    const gap = computeGapSet(text, lexicon, new Set(["uno", "dos", "tres"]));
    expect(gap.kind).toBe("none");
  });

  it("returns too-large when the gap exceeds the cap", () => {
    const lexicon = esLexicon();
    const held = new Set<string>();
    const words = Array.from({ length: 80 }, (_, index) => {
      const ranks = ["seis", "siete", "ocho", "nueve", "diez", "once", "doce"];
      return ranks[index % ranks.length] ?? "seis";
    }).join(" ");

    const gap = computeGapSet(words, lexicon, held, { cap: 3 });
    expect(gap.kind).toBe("too-large");
    if (gap.kind === "too-large") expect(gap.gapCount).toBeGreaterThan(3);
  });

  it("suggests a higher-coverage alternate among demanding sources", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const lexicon = esLexicon();
    const held = new Set(["uno", "dos", "tres", "cuatro", "cinco"]);

    const entries = sources.map((source) => {
      const text = source.body ?? "";
      const coverage = computeCoverage(text, lexicon, held);
      const gap = computeGapSet(text, lexicon, held);
      return {
        source,
        coverage,
        gapCount: gap.kind === "list" || gap.kind === "too-large" ? gap.gapCount : 0,
      };
    });

    const demanding = entries.filter((entry) => entry.coverage.comfortBand === "demanding");
    if (demanding.length < 2) return;

    const alternate = pickAlternateSource(entries, demanding[0]!.source.id);
    expect(alternate?.id).not.toBe(demanding[0]!.source.id);
  });

  it("estimates a day range when pace variance is high", () => {
    const estimate = estimateGapPace(10, [0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0, 3, 0, 0]);
    expect(estimate.days).toBeGreaterThan(0);
    expect(estimate.range).not.toBeNull();
  });

  it("respects the default cap constant", () => {
    expect(GAP_LIST_CAP).toBe(40);
  });
});
