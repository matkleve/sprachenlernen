import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  acceptedSurfaces,
  buildFormInverseIndex,
  gradeFormAnswer,
  isQuarantinedSurface,
} from "@/lib/form-inverse-index";
import { loadLemmaTable } from "@/lib/lemma-table";
import { parseFrequencyList } from "@/lib/lexicon";

const esTable = loadLemmaTable(
  JSON.parse(readFileSync(join(process.cwd(), "data/lemma/es.json"), "utf8")),
  "es",
).table!;
const frequency = parseFrequencyList(
  readFileSync(join(process.cwd(), "data/frequency/es.txt"), "utf8"),
);

describe("form-inverse-index", () => {
  const index = buildFormInverseIndex(esTable, { frequency });

  it("lists hablas and hablás for hablar ind.pres.2sg but not habla", () => {
    const forms = acceptedSurfaces(index, "hablar", "ind.pres.2sg");
    expect(forms).toContain("hablas");
    expect(forms).toContain("hablás");
    expect(forms).not.toContain("habla");
  });

  it("quarantines estan when están exists for estar ind.pres.3pl", () => {
    expect(isQuarantinedSurface("estan", "estar", "ind.pres.3pl", new Set(["están", "estan"]))).toBe(
      true,
    );
    const forms = acceptedSurfaces(index, "estar", "ind.pres.3pl");
    expect(forms).toContain("están");
    expect(forms).not.toContain("estan");
  });

  it("quarantines bare a for haber ind.pres.3sg", () => {
    const forms = acceptedSurfaces(index, "haber", "ind.pres.3sg");
    expect(forms).not.toContain("a");
    expect(forms.length).toBeGreaterThan(0);
  });

  it("marks exactly one primary form per cell", () => {
    const entry = index.get("hablar|ind.pres.2sg");
    expect(entry?.forms.filter((form) => form.primary)).toHaveLength(1);
  });

  it("grades any accepted surface as correct", () => {
    expect(gradeFormAnswer(index, "hablar", "ind.pres.2sg", "hablás").correct).toBe(true);
    expect(gradeFormAnswer(index, "hablar", "ind.pres.2sg", "hablas").correct).toBe(true);
    expect(gradeFormAnswer(index, "hablar", "ind.pres.2sg", "habla").correct).toBe(false);
  });
});
