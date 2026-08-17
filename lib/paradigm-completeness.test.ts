import { describe, expect, it } from "vitest";

import { loadLemmaTable } from "@/lib/lexicon";
import {
  VERB_PARADIGM_COMPLETE_MIN_CELLS,
  createParadigmCompletenessChecker,
  isVerbParadigmIncomplete,
  verbCellCount,
} from "@/lib/paradigm-completeness";

import esLemmaRaw from "@/data/lemma/es.json";

const table = loadLemmaTable(esLemmaRaw, "es").table!;

describe("paradigm completeness", () => {
  it("uses the same threshold as the lemma-table build script", () => {
    expect(VERB_PARADIGM_COMPLETE_MIN_CELLS).toBe(30);
  });

  it("does not flag non-verbs", () => {
    expect(isVerbParadigmIncomplete(table, "el")).toBe(false);
  });

  it("flags verbs below the complete cell count", () => {
    const incomplete = Object.keys(table.lemmas).find((lemma) =>
      isVerbParadigmIncomplete(table, lemma),
    );
    expect(incomplete).toBeDefined();
    expect(verbCellCount(table, incomplete!)).toBeGreaterThan(0);
    expect(verbCellCount(table, incomplete!)).toBeLessThan(VERB_PARADIGM_COMPLETE_MIN_CELLS);
  });

  it("exposes a checker for level-model form mastery", () => {
    const checker = createParadigmCompletenessChecker(table);
    expect(typeof checker("ser")).toBe("boolean");
  });
});
