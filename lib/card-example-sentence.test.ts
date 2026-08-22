/**
 * Contract: docs/specs/feature/card-example-sentence.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  exampleSentenceComfortBand,
  loadExampleSentenceBank,
  pickExampleSentence,
} from "@/lib/card-example-sentence";
import { sentenceTranslationKey } from "@/lib/description-keys";
import { resolveDescription } from "@/lib/gloss-resolver";
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

describe("card-example-sentence", () => {
  it("loads the shipped Spanish bank", () => {
    const bank = loadExampleSentenceBank("es");
    expect(bank?.sentences.length).toBeGreaterThan(0);
  });

  it("prefers a politics-tagged sentence for gobierno when activeWorld is politics", () => {
    const bank = loadExampleSentenceBank("es")!;
    const held = new Set(["gobierno", "el", "anunciar", "medida"]);

    const politicsPick = pickExampleSentence({
      bank,
      wordId: "es:gobierno",
      heldLemmas: held,
      lexicon: esLexicon(),
      activeWorld: "politics",
      salt: "2026-08-21:es:gobierno:meaning-recall",
    });
    expect(politicsPick?.id).toBe("es-ex-gobierno-politics");
  });

  it("biases world-matching sentences when coverage ties", () => {
    const bank = loadExampleSentenceBank("es")!;
    const held = new Set(["gobierno", "el"]);
    const picks = Array.from({ length: 40 }, (_, index) =>
      pickExampleSentence({
        bank,
        wordId: "es:gobierno",
        heldLemmas: held,
        lexicon: esLexicon(),
        activeWorld: "politics",
        salt: `salt-${index}:es:gobierno:meaning-recall`,
      })?.id,
    );
    const politicsCount = picks.filter((id) => id === "es-ex-gobierno-politics").length;
    const neutralCount = picks.filter((id) => id === "es-ex-gobierno-neutral").length;
    expect(politicsCount).toBeGreaterThan(neutralCount);
  });

  it("returns null when the lemma has no bank sentences", () => {
    const bank = loadExampleSentenceBank("es")!;
    const pick = pickExampleSentence({
      bank,
      wordId: "es:zzzzz",
      heldLemmas: new Set(["casa"]),
      lexicon: esLexicon(),
      activeWorld: "general",
      salt: "2026-08-21:es:zzzzz:meaning-recall",
    });
    expect(pick).toBeNull();
  });

  it("picks the same sentence for the same salt", () => {
    const bank = loadExampleSentenceBank("es")!;
    const held = new Set(["casa", "es", "grande", "la"]);
    const input = {
      bank,
      wordId: "es:casa",
      heldLemmas: held,
      lexicon: esLexicon(),
      activeWorld: "everyday" as const,
      salt: "2026-08-21:es:casa:meaning-recall",
    };
    expect(pickExampleSentence(input)).toEqual(pickExampleSentence(input));
  });

  it("chooses a comfortable sentence for casa when held lemmas cover it", () => {
    const bank = loadExampleSentenceBank("es")!;
    const held = new Set(["casa", "grande", "ser", "el", "la"]);
    const pick = pickExampleSentence({
      bank,
      wordId: "es:casa",
      heldLemmas: held,
      lexicon: esLexicon(),
      activeWorld: "everyday",
      salt: "2026-08-21:es:casa:meaning-recall",
    });
    expect(pick?.text).toContain("casa");
    expect(["comfortable", "speed"]).toContain(
      exampleSentenceComfortBand(pick!.text, esLexicon(), held),
    );
  });

  it("resolves sentence translation in the spoken language (German)", () => {
    const german = resolveDescription(
      sentenceTranslationKey("es-hoy-leo-libro"),
      "de",
      "Today I read the book.",
    );
    expect(german).toBe("Heute habe ich das Buch gelesen.");
    expect(german).not.toBe("Today I read the book.");
  });
});
