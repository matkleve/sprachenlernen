/**
 * Contract: docs/specs/service/sentence-check.acceptance-criteria.md
 *
 * Runs against the real shipped table, not a fixture: the whole question this
 * module answers is whether the rules survive contact with 48k real forms.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadLemmaTable } from "@/lib/lemma-table";
import { checkSentence } from "@/lib/sentence-check";
import type { FindingCategory, SentenceCheckResult } from "@/lib/sentence-check";

const TABLE = loadLemmaTable(
  JSON.parse(readFileSync(join(process.cwd(), "data/lemma/es.json"), "utf8")),
  "es",
).table!;

function check(text: string, target?: { lemma: string; word: string }): SentenceCheckResult {
  return checkSentence(
    { text, targetLemma: target?.lemma, targetWord: target?.word },
    TABLE,
    "es",
  );
}

function categories(text: string): FindingCategory[] {
  const result = check(text);
  if (result.status !== "checked") throw new Error(`unavailable: ${result.reason}`);
  return result.findings.map((finding) => finding.category);
}

function flagged(text: string, category: FindingCategory): string[] {
  const result = check(text);
  if (result.status !== "checked") throw new Error(`unavailable: ${result.reason}`);
  return result.findings
    .filter((finding) => finding.category === category && finding.tokenIndex >= 0)
    .map((finding) => result.tokens[finding.tokenIndex]!.text);
}

function words(result: SentenceCheckResult): string[] {
  return result.status === "checked" ? result.tokens.map((token) => token.text) : [];
}

describe("what the learner gets back (R)", () => {
  it("R1 · the sentence survives the check exactly as written", () => {
    const written = "¿Dónde está la casa, mamá? ¡No sé!";
    const result = check(written);
    if (result.status !== "checked") throw new Error("unavailable");

    // The checked view rebuilds the line from this. Dropping punctuation would
    // show the learner a sentence they did not write, right next to a claim
    // about what is wrong with it.
    expect(result.text).toBe(written);
  });

  it("R2 · every token points at its own characters in that text", () => {
    const written = "Mi  casa, es grande";
    const result = check(written);
    if (result.status !== "checked") throw new Error("unavailable");

    for (const token of result.tokens) {
      expect(written.slice(token.start, token.end)).toBe(token.text);
    }
  });
});

describe("honesty (H)", () => {
  it("H1 · a clean sentence reports no findings and claims nothing", () => {
    const result = check("Mi casa es grande");
    expect(result).toMatchObject({ status: "checked", findings: [] });
    expect(words(result)).toEqual(["Mi", "casa", "es", "grande"]);
  });

  it("H3 · a language without rules is unavailable, not silently clean", () => {
    expect(checkSentence({ text: "Mi casa es grande" }, TABLE, "de")).toEqual({
      status: "unavailable",
      reason: "no-lexicon",
    });
  });

  it("H3 · a missing table is unavailable, not silently clean", () => {
    expect(checkSentence({ text: "Mi casa" }, undefined, "es")).toEqual({
      status: "unavailable",
      reason: "no-lexicon",
    });
  });
});

describe("spelling (S)", () => {
  it("S1 · known forms are not flagged", () => {
    expect(categories("Mi casa es grande")).toEqual([]);
  });

  it("S2 · flags only the non-word, not the real word used oddly", () => {
    expect(flagged("Mi caza es grandee", "spelling")).toEqual(["grandee"]);
  });

  it("S3 · a capitalised unknown mid-sentence is a proper-noun candidate", () => {
    expect(categories("Vivo en Madrid")).toEqual([]);
  });

  it("S4 · lowercase unknowns are flagged", () => {
    expect(flagged("vivo en madridd", "spelling")).toEqual(["madridd"]);
  });

  it("S5 · offers the single form one edit away", () => {
    const result = check("Mi casa es graande");
    if (result.status !== "checked") throw new Error("unavailable");
    expect(result.findings[0]).toMatchObject({
      category: "spelling",
      suggestion: "grande",
      messageKey: "spellingWithSuggestion",
    });
  });

  it("S6 · several candidates one edit away means no guess", () => {
    const result = check("Mi casaa es grande");
    if (result.status !== "checked") throw new Error("unavailable");
    expect(result.findings[0]).toMatchObject({
      category: "spelling",
      messageKey: "spellingUnknown",
    });
    expect(result.findings[0]?.suggestion).toBeUndefined();
  });

  it("S7 · fused forms resolve through the table", () => {
    expect(categories("Vengo del campo")).toEqual([]);
  });

  it("S8 · a sentence-initial capital is folded before lookup", () => {
    expect(categories("La casa es grande")).toEqual([]);
  });
});

describe("agreement (A)", () => {
  it("A1 · flags a gender clash on the determiner and suggests the fit", () => {
    const result = check("el casa es grande");
    if (result.status !== "checked") throw new Error("unavailable");
    const finding = result.findings.find((f) => f.category === "agreement");
    expect(result.tokens[finding!.tokenIndex]?.text).toBe("el");
    expect(finding?.suggestion).toBe("la");
  });

  it("A2 · agreeing determiner and noun are silent", () => {
    expect(categories("la casa es grande")).toEqual([]);
  });

  it("A3 · flags a number clash", () => {
    expect(flagged("las casa es grande", "agreement")).toEqual(["las"]);
  });

  it("A4 · the table decides gender, not the ending", () => {
    expect(categories("la mano es grande")).toEqual([]);
  });

  it("A5 · el agua is not an error", () => {
    expect(categories("el agua es fría")).toEqual([]);
  });

  it("A8 · flags an adjective that disagrees with its noun", () => {
    expect(flagged("una casa blancos", "agreement")).toEqual(["blancos"]);
  });
});

describe("person (P)", () => {
  it("P1 · flags a verb that contradicts an explicit pronoun", () => {
    const result = check("yo tienes un perro");
    if (result.status !== "checked") throw new Error("unavailable");
    const finding = result.findings.find((f) => f.category === "person");
    expect(result.tokens[finding!.tokenIndex]?.text).toBe("tienes");
    expect(finding?.suggestion).toBe("tengo");
  });

  it("P2 · a matching pronoun and verb are silent", () => {
    expect(categories("yo tengo un perro")).toEqual([]);
  });

  it("P3 · pro-drop leaves nothing to contradict", () => {
    expect(categories("tienes un perro")).toEqual([]);
  });

  it("P4 · plural pronouns agree too", () => {
    expect(categories("nosotros vamos")).toEqual([]);
  });
});

describe("target word (T)", () => {
  it("T1 · the target word used directly is not missing", () => {
    expect(categories("Mi casa es grande")).toEqual([]);
    expect(check("Mi casa es grande", { lemma: "casa", word: "casa" }).status).toBe("checked");
    expect(
      check("Mi casa es grande", { lemma: "casa", word: "casa" }),
    ).toMatchObject({ findings: [] });
  });

  it("T2 · any inflected form of the lemma counts", () => {
    expect(
      check("Las casas son grandes", { lemma: "casa", word: "casa" }),
    ).toMatchObject({ findings: [] });
  });

  it("T3 · an absent target is reported against the sentence, not a token", () => {
    const result = check("Mi perro es grande", { lemma: "casa", word: "casa" });
    if (result.status !== "checked") throw new Error("unavailable");
    expect(result.findings).toEqual([
      {
        tokenIndex: -1,
        category: "missing-target",
        messageKey: "missingTarget",
        messageValues: { word: "casa" },
      },
    ]);
  });

  it("T4 · no target means no target finding", () => {
    expect(categories("Mi perro es grande")).toEqual([]);
  });
});

describe("tokenising (K)", () => {
  it("K1 · punctuation is never a token", () => {
    const result = check("¿Dónde está la casa?");
    expect(words(result)).toEqual(["Dónde", "está", "la", "casa"]);
  });

  it("K2 · accents are significant and both spellings are real words", () => {
    expect(categories("no sé")).toEqual([]);
    expect(categories("no se")).toEqual([]);
  });

  it("K3 · collapsed whitespace keeps indices contiguous", () => {
    const result = check("Mi   casa\n es grande");
    expect(words(result)).toEqual(["Mi", "casa", "es", "grande"]);
  });
});
