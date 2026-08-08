import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildLexicon,
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

describe("lexicon · AC-5/AC-6 resolving a form", () => {
  const table = { fue: "ser", son: "ser" };

  it("returns the lemma when the table has it", () => {
    const lex = buildLexicon(profile(), parseFrequencyList(LIST), table);
    expect(lex.resolve("Fue")).toEqual({ value: "ser", resolved: "lemma" });
  });

  it("returns the normalised form when the table does not", () => {
    const lex = buildLexicon(profile(), parseFrequencyList(LIST), table);
    expect(lex.resolve("Perro")).toEqual({ value: "perro", resolved: "form" });
  });

  it("never guesses when there is no table at all", () => {
    const lex = buildLexicon(profile(), parseFrequencyList(LIST));
    expect(lex.resolve("fue")).toEqual({ value: "fue", resolved: "form" });
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

describe("lexicon · AC-10 the shipped profiles load and report tier C", () => {
  it.each(["es", "it"])("%s validates", (code) => {
    const { profile: loaded, errors } = loadProfile(
      JSON.parse(readData(`data/languages/${code}.json`)),
    );
    expect(errors).toEqual([]);
    expect(loaded?.code).toBe(code);
  });

  it.each(["es", "it"])("%s is tier C — form frequencies, no lemma table yet", (code) => {
    const { profile: loaded } = loadProfile(JSON.parse(readData(`data/languages/${code}.json`)));
    expect(qualityTier(loaded!)).toBe("C");
  });

  it.each(["es", "it"])("%s declares its frequency unit as form, not lemma", (code) => {
    const { profile: loaded } = loadProfile(JSON.parse(readData(`data/languages/${code}.json`)));
    expect(loaded?.frequency.unit).toBe("form");
  });
});
