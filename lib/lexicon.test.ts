import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  qualityTier,
  type LanguageProfile,
} from "@/lib/lexicon";

/** Contract: docs/specs/service/lexicon.md — one describe per AC. */

const ROOT = join(import.meta.dirname, "..");
const readData = (path: string) => readFileSync(join(ROOT, path), "utf8");

const VALID: unknown = {
  code: "xx",
  name: "Test",
  script: "latin",
  morphology: "fusional",
  countingUnit: "lemma",
  frequency: { source: "s", corpus: "c", version: "1", licence: "MIT", unit: "form", file: "f" },
};

const withoutKey = (key: string) => {
  const copy = { ...(VALID as Record<string, unknown>) };
  delete copy[key];
  return copy;
};

const profile = (overrides: Record<string, unknown> = {}): LanguageProfile =>
  loadProfile({ ...(VALID as Record<string, unknown>), ...overrides }).profile!;

const LIST = "# comment\nuno 100\ndos 90\ntres 80\n";

/** A miniature of the shipped tables: one unambiguous form, one ambiguous, one fused. */
const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 3,
  seedCoverage: 1,
  verbLemmas: 1,
  verbParadigmsComplete: 1,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { casar: { verb: "1" }, casa: { noun: "f" } },
  fused: { del: ["de", "el"] },
  forms: {
    fue: [["ser", "verb", "ind.pret.3sg"]],
    casa: [
      ["casa", "noun", "sg"],
      ["casar", "verb", "ind.pres.3sg"],
    ],
    del: [["del", "adp", ""]],
  },
};

const TABLE = loadLemmaTable(RAW_TABLE, "es").table!;

describe("lexicon · AC-1 a profile without countingUnit is rejected", () => {
  it("refuses to load", () => {
    expect(loadProfile(withoutKey("countingUnit")).profile).toBeUndefined();
  });

  it("names the missing field", () => {
    expect(loadProfile(withoutKey("countingUnit")).errors.join(" ")).toMatch(/countingUnit/);
  });

  it("is not silently defaulted", () => {
    const { profile: loaded } = loadProfile(withoutKey("countingUnit"));
    expect(loaded?.countingUnit).toBeUndefined();
  });
});

describe("lexicon · AC-2 unknown enum values are rejected", () => {
  it.each([
    ["script", "runes"],
    ["morphology", "polysynthetic-ish"],
    ["countingUnit", "syllable"],
  ])("rejects %s = %s", (key, value) => {
    expect(loadProfile({ ...(VALID as object), [key]: value }).profile).toBeUndefined();
  });

  it("accepts the shipped enum values", () => {
    expect(loadProfile(VALID).errors).toEqual([]);
  });
});

describe("lexicon · AC-3 tokenising drops punctuation and keeps positions", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST));

  it("splits on punctuation and whitespace", () => {
    expect(lex().tokenise("Uno, dos. ¿Tres?").map((t) => t.text)).toEqual(["Uno", "dos", "Tres"]);
  });

  it("drops digits", () => {
    expect(lex().tokenise("uno 42 dos").map((t) => t.text)).toEqual(["uno", "dos"]);
  });

  it("keeps the position of each token", () => {
    const text = "Uno, dos.";
    for (const token of lex().tokenise(text)) {
      expect(text.slice(token.start, token.end)).toBe(token.text);
    }
  });

  it("keeps apostrophes inside a word", () => {
    expect(lex().tokenise("dell'acqua").map((t) => t.text)).toEqual(["dell'acqua"]);
  });
});

describe("lexicon · AC-4 normalising collapses case and surrounding punctuation", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST));

  it.each([
    ["Uno", "uno"],
    ["UNO", "uno"],
    ["¡uno!", "uno"],
    ["uno,", "uno"],
  ])("normalises %s to %s", (input, expected) => {
    expect(lex().normalise(input)).toBe(expected);
  });

  it("keeps accents, which are part of the word in Spanish", () => {
    expect(lex().normalise("Está")).toBe("está");
  });
});

describe("lexicon · AC-5/AC-6/AC-13 resolving a form", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), TABLE);

  it("returns the single analysis when the table has exactly one", () => {
    expect(lex().resolve("Fue")).toEqual({
      kind: "single",
      form: "fue",
      analysis: { lemma: "ser", pos: "verb", cell: "ind.pret.3sg" },
    });
  });

  it("returns unknown when the table does not have the form", () => {
    expect(lex().resolve("Perro")).toEqual({ kind: "unknown", form: "perro" });
  });

  it("AC-13 · never guesses when there is no table at all", () => {
    const bare = buildLexicon(profile(), parseFrequencyList(LIST));
    expect(bare.resolve("fue")).toEqual({ kind: "unknown", form: "fue" });
  });

  it("AC-6 · does not borrow an analysis from a similar form", () => {
    expect(lex().resolve("fueron")).toEqual({ kind: "unknown", form: "fueron" });
  });
});

describe("lexicon · AC-11 ambiguity is reported, not resolved", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), TABLE);

  it("returns every analysis", () => {
    const result = lex().resolve("casa");
    expect(result.kind).toBe("ambiguous");
    if (result.kind !== "ambiguous") return;
    expect(result.analyses).toHaveLength(2);
  });

  it("keeps the table's order, likeliest first", () => {
    const result = lex().resolve("casa");
    if (result.kind !== "ambiguous") throw new Error("expected ambiguous");
    expect(result.analyses.map((a) => a.lemma)).toEqual(["casa", "casar"]);
  });

  it("does not collapse to a single analysis", () => {
    expect(lex().resolve("casa").kind).not.toBe("single");
  });
});

describe("lexicon · AC-12 a fused form is not an ambiguous one", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), TABLE);

  it("lists the parts", () => {
    expect(lex().resolve("del")).toEqual({ kind: "fused", form: "del", parts: ["de", "el"] });
  });

  it("is never reported as ambiguous", () => {
    expect(lex().resolve("del").kind).not.toBe("ambiguous");
  });

  it("wins over any analyses recorded for the same form", () => {
    expect(lex().resolve("del").kind).toBe("fused");
  });
});

describe("lexicon · AC-14 resolution normalises its input", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), TABLE);

  it.each(["FUE", "¡fue!", "fue,"])("resolves %s like the table entry", (input) => {
    expect(lex().resolve(input)).toEqual(lex().resolve("fue"));
  });
});

describe("lexicon · AC-18/AC-19 what a lemma is, apart from its forms", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST), TABLE);

  it("gives a verb its conjugation class", () => {
    expect(lex().describe("casar")).toEqual({ conjugation: "1" });
  });

  it("gives a noun its gender", () => {
    expect(lex().describe("casa")).toEqual({ gender: "f" });
  });

  it("AC-19 · returns nothing for a lemma it does not describe", () => {
    expect(lex().describe("ser")).toBeUndefined();
  });

  it("AC-19 · never defaults a conjugation class", () => {
    expect(lex().describe("perro")).toBeUndefined();
  });
});

describe("lexicon · AC-20/AC-22 a table that cannot be trusted is refused", () => {
  it("AC-20 · rejects a table whose language is not the profile's", () => {
    expect(loadLemmaTable({ ...RAW_TABLE, language: "it" }, "es").table).toBeUndefined();
  });

  it("AC-20 · names the mismatch", () => {
    expect(loadLemmaTable({ ...RAW_TABLE, language: "it" }, "es").errors.join(" ")).toMatch(
      /language/,
    );
  });

  it("AC-22 · rejects an analysis that is not a triple", () => {
    const broken = { ...RAW_TABLE, forms: { fue: [["ser", "verb"]] } };
    expect(loadLemmaTable(broken, "es").table).toBeUndefined();
  });

  it("AC-22 · names the offending entry", () => {
    const broken = { ...RAW_TABLE, forms: { fue: [["ser", "verb"]] } };
    expect(loadLemmaTable(broken, "es").errors.join(" ")).toMatch(/fue/);
  });

  it("AC-22 · rejects a fused entry with fewer than two parts", () => {
    const broken = { ...RAW_TABLE, fused: { del: ["de"] } };
    expect(loadLemmaTable(broken, "es").table).toBeUndefined();
  });

  it("AC-22 · rejects an unknown part of speech", () => {
    const broken = { ...RAW_TABLE, forms: { fue: [["ser", "wizard", "inf"]] } };
    expect(loadLemmaTable(broken, "es").table).toBeUndefined();
  });

  it("AC-22 · rejects a cell name that is not one of ours", () => {
    const broken = { ...RAW_TABLE, forms: { fue: [["ser", "verb", "V;IND;PRS;3;SG"]] } };
    expect(loadLemmaTable(broken, "es").table).toBeUndefined();
  });

  it("accepts the table it was given", () => {
    expect(loadLemmaTable(RAW_TABLE, "es").errors).toEqual([]);
  });
});

describe("lexicon · AC-7 the tier is derived, not declared", () => {
  it("is C with a frequency list only", () => {
    expect(qualityTier(profile())).toBe("C");
  });

  it("is B once a lemma table exists", () => {
    expect(qualityTier(profile({ lemmaTable: "data/lemma/xx.txt" }))).toBe("B");
  });

  it("is A once a dated calibration exists too", () => {
    expect(
      qualityTier(profile({ lemmaTable: "data/lemma/xx.txt", calibration: { dated: "2026-08-08" } })),
    ).toBe("A");
  });

  it("ignores a hand-set tier field", () => {
    expect(qualityTier(profile({ qualityTier: "A" }))).toBe("C");
  });
});

describe("lexicon · AC-8 ranks are dense, 1-based and ordered", () => {
  it("assigns ranks in file order", () => {
    expect(parseFrequencyList(LIST).map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it("skips comments and blank lines", () => {
    expect(parseFrequencyList("# x\n\nuno 5\n").map((e) => e.form)).toEqual(["uno"]);
  });

  it("holds for the shipped lists", () => {
    for (const code of ["es", "it"]) {
      const entries = parseFrequencyList(readData(`data/frequency/${code}.txt`));
      expect(entries.length).toBe(5000);
      expect(entries.map((e) => e.rank)).toEqual(entries.map((_, i) => i + 1));
    }
  });
});

describe("lexicon · AC-9 an unlisted word has no rank", () => {
  const lex = () => buildLexicon(profile(), parseFrequencyList(LIST));

  it("returns undefined rather than zero", () => {
    expect(lex().rank("cuatro")).toBeUndefined();
  });

  it("returns undefined rather than the list length", () => {
    expect(lex().rank("cuatro")).not.toBe(3);
  });

  it("finds a listed word regardless of case", () => {
    expect(lex().rank("Uno")).toBe(1);
  });
});

describe("lexicon · AC-10 the shipped profiles load and report tier B", () => {
  it.each(["es", "it"])("%s validates", (code) => {
    const { profile: loaded, errors } = loadProfile(
      JSON.parse(readData(`data/languages/${code}.json`)),
    );
    expect(errors).toEqual([]);
    expect(loaded?.code).toBe(code);
  });

  it.each(["es", "it"])("%s is tier B — a lemma table, no dated calibration", (code) => {
    const { profile: loaded } = loadProfile(JSON.parse(readData(`data/languages/${code}.json`)));
    expect(qualityTier(loaded!)).toBe("B");
  });

  it.each(["es", "it"])("%s declares its frequency unit as form, not lemma", (code) => {
    const { profile: loaded } = loadProfile(JSON.parse(readData(`data/languages/${code}.json`)));
    expect(loaded?.frequency.unit).toBe("form");
  });
});

describe("lexicon · AC-15/AC-16 paradigm cells in the shipped tables", () => {
  const shipped = (code: string) =>
    loadLemmaTable(JSON.parse(readData(`data/lemma/${code}.json`)), code).table!;

  const cellOf = (code: string, form: string, lemma: string) => {
    const { profile: loaded } = loadProfile(JSON.parse(readData(`data/languages/${code}.json`)));
    const lex = buildLexicon(loaded!, parseFrequencyList(readData(`data/frequency/${code}.txt`)), shipped(code));
    const result = lex.resolve(form);
    const analyses =
      result.kind === "single" ? [result.analysis] : result.kind === "ambiguous" ? result.analyses : [];
    return analyses.find((a) => a.lemma === lemma)?.cell;
  };

  it("AC-15 · Spanish hablo is the 1sg present indicative", () => {
    expect(cellOf("es", "hablo", "hablar")).toBe("ind.pres.1sg");
  });

  it("AC-15 · Spanish hablado is the masculine singular past participle", () => {
    expect(cellOf("es", "hablado", "hablar")).toBe("part.past.m.sg");
  });

  it("AC-16 · the same cell name spans Italian's conjugation classes", () => {
    // The whole point of the objection this table exists to answer: knowing
    // `parlare` says nothing about `dormire`, so the two have to be comparable.
    expect(cellOf("it", "parliamo", "parlare")).toBe("ind.pres.1pl");
    expect(cellOf("it", "dormiamo", "dormire")).toBe("ind.pres.1pl");
    expect(cellOf("it", "temiamo", "temere")).toBe("ind.pres.1pl");
  });

  it("AC-16 · and the classes are recorded as different", () => {
    const table = shipped("it");
    expect(table.lemmas["parlare"]).toEqual({ verb: "1" });
    expect(table.lemmas["temere"]).toEqual({ verb: "2" });
    expect(table.lemmas["dormire"]).toEqual({ verb: "3" });
  });
});

describe("lexicon · AC-17 no source-format tag ever reaches a caller", () => {
  it.each(["es", "it"])("%s uses only documented cell names", (code) => {
    const raw: unknown = JSON.parse(readData(`data/lemma/${code}.json`));
    // Loading is the check: an undocumented cell is a rejection, not a warning.
    expect(loadLemmaTable(raw, code).errors).toEqual([]);
  });

  it.each(["es", "it"])("%s decomposes its fused forms into at least two parts", (code) => {
    const table = loadLemmaTable(JSON.parse(readData(`data/lemma/${code}.json`)), code).table!;
    for (const [form, parts] of Object.entries(table.fused)) {
      expect(parts.length, form).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("lexicon · AC-21 the table reports its own limits", () => {
  it.each(["es", "it"])("%s carries measured coverage a caller need not re-derive", (code) => {
    const table = loadLemmaTable(JSON.parse(readData(`data/lemma/${code}.json`)), code).table!;
    expect(table.seedCoverage).toBeGreaterThan(0.9);
    expect(table.seedCoverage).toBeLessThanOrEqual(1);
    expect(table.verbParadigmsComplete).toBeGreaterThan(0.9);
  });

  it.each(["es", "it"])("%s records where every part of it came from", (code) => {
    const table = loadLemmaTable(JSON.parse(readData(`data/lemma/${code}.json`)), code).table!;
    expect(table.sources.length).toBeGreaterThan(1);
    for (const source of table.sources) {
      expect(source.licence).not.toBe("");
      expect(source.url).toMatch(/^https:/);
    }
  });
});
