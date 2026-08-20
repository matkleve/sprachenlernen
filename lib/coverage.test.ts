/**
 * Contract: docs/specs/service/coverage.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  appendCoverageHistory,
  buildLemmaSourceIndex,
  comfortBandFor,
  computeCoverage,
  computeWindowCoverage,
  isTokenKnown,
  loadSources,
  roundCoveragePercent,
  sourcesForTopic,
  type Source,
} from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  type LanguageProfile,
} from "@/lib/lexicon";

const ROOT = join(import.meta.dirname, "..");
const readData = (path: string) => readFileSync(join(ROOT, path), "utf8");

const LIST = "# comment\nuno 100\ndos 90\ntres 80\ncuatro 70\ncinco 60\n";

const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 5,
  seedCoverage: 1,
  verbLemmas: 1,
  verbParadigmsComplete: 1,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { casar: { verb: "1" }, casa: { noun: "f" } },
  fused: { del: ["de", "el"] },
  forms: {
    uno: [["uno", "num", ""]],
    dos: [["dos", "num", ""]],
    tres: [["tres", "num", ""]],
    cuatro: [["cuatro", "num", ""]],
    cinco: [["cinco", "num", ""]],
    el: [["el", "det", ""]],
    la: [["la", "det", ""]],
    casa: [
      ["casa", "noun", "sg"],
      ["casar", "verb", "ind.pres.3sg"],
    ],
    del: [["del", "adp", ""]],
    de: [["de", "adp", ""]],
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

const TABLE = loadLemmaTable(RAW_TABLE, "es").table!;

const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), TABLE);

const held = (...lemmas: string[]) => new Set(lemmas);

describe("coverage · AC-1 all tokens known", () => {
  it("returns 100.0 %", () => {
    const result = computeCoverage("uno dos tres", lex(), held("uno", "dos", "tres"));
    expect(result.coveragePercent).toBe(100);
    expect(result.tokenCount).toBe(3);
    expect(result.knownCount).toBe(3);
    expect(result.comfortBand).toBe("speed");
  });
});

describe("coverage · AC-2 one unknown in ten", () => {
  it("returns 90.0 %", () => {
    const text = [...Array(9).fill("uno"), "zzzzz"].join(" ");
    const result = computeCoverage(text, lex(), held("uno"));
    expect(result.coveragePercent).toBe(90);
    expect(result.tokenCount).toBe(10);
    expect(result.knownCount).toBe(9);
  });
});

describe("coverage · AC-3 comfort bands", () => {
  it.each([
    [94.9, "demanding"],
    [95.0, "comfortable"],
    [98.0, "comfortable"],
    [98.1, "speed"],
  ] as const)("maps %s to %s", (percent, band) => {
    expect(comfortBandFor(percent)).toBe(band);
  });
});

describe("coverage · AC-4 reverse lemma index", () => {
  it("lists both source ids for a shared lemma", () => {
    const sources: Source[] = [
      {
        id: "a",
        languageCode: "es",
        kind: "text",
        title: "A",
        origin: "fixture",
        body: "casa casa",
        addedAt: "2026-08-17T00:00:00.000Z",
      },
      {
        id: "b",
        languageCode: "es",
        kind: "text",
        title: "B",
        origin: "fixture",
        body: "casa",
        addedAt: "2026-08-17T00:00:00.000Z",
      },
    ];

    const index = buildLemmaSourceIndex(sources, lex());
    expect(index.get("casa")).toEqual(["a", "b"]);
  });
});

describe("coverage · AC-5 window coverage", () => {
  it("returns the best window first", () => {
    const knownWord = "uno";
    const unknownWord = "zzzzz";
    const heldLemmas = held("uno");

    const tokens: string[] = [];
    const pushUnknown = (n: number) => tokens.push(...Array(n).fill(unknownWord));
    const pushKnown = (n: number) => tokens.push(...Array(n).fill(knownWord));

    pushUnknown(10);
    pushKnown(24);
    pushUnknown(1);
    while (tokens.length < 100) {
      const remaining = 100 - tokens.length;
      const knownNeeded = 80 - tokens.filter((t) => t === knownWord).length;
      const unknownNeeded = 20 - tokens.filter((t) => t === unknownWord).length;
      const knownChunk = Math.min(24, knownNeeded, remaining - Math.min(1, unknownNeeded));
      pushKnown(knownChunk);
      if (tokens.length < 100 && unknownNeeded > 0) pushUnknown(1);
    }

    const text = tokens.join(" ");

    const full = computeCoverage(text, lex(), heldLemmas);
    expect(full.coveragePercent).toBe(80);
    expect(full.tokenCount).toBe(100);

    const windows = computeWindowCoverage(text, lex(), heldLemmas, {
      windowSec: 60,
      wordsPerMinute: 25,
    });
    expect(windows[0]?.coveragePercent).toBe(96);
    expect(windows.find((w) => w.startToken === 10)?.coveragePercent).toBe(96);
  });
});

describe("coverage · AC-6 fused forms", () => {
  it("counts partially known fused token as not known", () => {
    expect(isTokenKnown("del", lex(), held("de"))).toBe(false);
    expect(isTokenKnown("del", lex(), held("de", "el"))).toBe(true);

    const result = computeCoverage("del casa", lex(), held("de", "casa"));
    expect(result.coveragePercent).toBe(50);
  });
});

describe("coverage · AC-7 coverage history", () => {
  it("stores calibration date from profile", () => {
    const dated = profile();
    dated.calibration = { dated: "2026-08-01" };
    const row = appendCoverageHistory([], 91.2, dated, "2026-08-17T12:00:00.000Z");
    expect(row[0]?.calibrationDated).toBe("2026-08-01");
    expect(row[0]?.coveragePercent).toBe(91.2);
  });
});

describe("coverage · topic filter", () => {
  it("ranks sources by coverage for a topic tag", () => {
    const sources: Source[] = [
      {
        id: "news-hard",
        languageCode: "es",
        kind: "text",
        title: "Hard news",
        origin: "catalogue",
        body: "zzzzz zzzzz zzzzz uno",
        tags: ["news"],
        addedAt: "2026-08-17T00:00:00.000Z",
      },
      {
        id: "news-easy",
        languageCode: "es",
        kind: "text",
        title: "Easy news",
        origin: "catalogue",
        body: "uno dos tres",
        tags: ["news"],
        addedAt: "2026-08-17T00:00:00.000Z",
      },
    ];

    const ranked = sourcesForTopic(sources, "news", lex(), held("uno", "dos", "tres"));
    expect(ranked[0]?.source.id).toBe("news-easy");
    expect(ranked[0]?.coverage.coveragePercent).toBe(100);
  });
});

describe("coverage · fixture data", () => {
  it("loads shipped es content sources", () => {
    const { sources, errors } = loadSources(JSON.parse(readData("data/content/es.json")));
    expect(errors).toEqual([]);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every((s) => s.languageCode === "es")).toBe(true);
  });

  it("refuses catalogue sources without licence.kind", () => {
    const { sources, errors } = loadSources([
      {
        id: "bad-news",
        languageCode: "es",
        kind: "text",
        title: "Missing licence",
        origin: "catalogue",
        body: "Hola",
        addedAt: "2026-08-17T00:00:00.000Z",
      },
    ]);
    expect(sources).toEqual([]);
    expect(errors.some((error) => error.includes("licence.kind"))).toBe(true);
  });

  it("computes coverage on shipped es fixture text", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const fixture = sources.find((s) => s.id === "es-fixture-cafe");
    expect(fixture).toBeDefined();
    const result = computeCoverage(fixture!.body!, lex(), held("uno", "dos", "el", "la"));
    expect(result.tokenCount).toBeGreaterThan(0);
    expect(result.coveragePercent).toBeGreaterThan(0);
  });
});

describe("coverage · helpers", () => {
  it("rounds to one decimal", () => {
    expect(roundCoveragePercent(1, 3)).toBe(33.3);
    expect(roundCoveragePercent(0, 0)).toBe(100);
  });
});
