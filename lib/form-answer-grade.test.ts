/**
 * Contract: docs/specs/service/form-practice.md (accents §)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { gradeTypedFormAnswer, lemmaSurfacesForLemma } from "@/lib/form-answer-grade";
import { acceptedSurfaces, buildFormInverseIndex } from "@/lib/form-inverse-index";
import { loadLemmaTable } from "@/lib/lemma-table";
import { parseFrequencyList } from "@/lib/lexicon";

const esTable = loadLemmaTable(
  JSON.parse(readFileSync(join(process.cwd(), "data/lemma/es.json"), "utf8")),
  "es",
).table!;
const frequency = parseFrequencyList(
  readFileSync(join(process.cwd(), "data/frequency/es.txt"), "utf8"),
);
const index = buildFormInverseIndex(esTable, { frequency });

describe("form-answer-grade", () => {
  const hablarLemmaSurfaces = lemmaSurfacesForLemma(esTable, "hablar");

  it("accepts an exact accepted surface", () => {
    const accepted = acceptedSurfaces(index, "hablar", "ind.pres.2sg");
    expect(
      gradeTypedFormAnswer({
        answer: "hablás",
        acceptedForms: accepted,
        lemmaSurfaces: hablarLemmaSurfaces,
      }).correct,
    ).toBe(true);
  });

  it("forgives a missing accent when the bare string is not another lemma form", () => {
    const accepted = acceptedSurfaces(index, "estar", "ind.pres.2sg");
    const estarSurfaces = lemmaSurfacesForLemma(esTable, "estar");
    const result = gradeTypedFormAnswer({
      answer: "estas",
      acceptedForms: accepted,
      lemmaSurfaces: estarSurfaces,
    });
    expect(result.correct).toBe(true);
    if (result.correct) expect(result.accentForgiven).toBe(true);
  });

  it("rejects an accent slip when the bare string is another form of the lemma", () => {
    const accepted = acceptedSurfaces(index, "hablar", "ind.fut.1sg");
    const result = gradeTypedFormAnswer({
      answer: "hablare",
      acceptedForms: accepted,
      lemmaSurfaces: hablarLemmaSurfaces,
    });
    expect(result.correct).toBe(false);
  });
});
