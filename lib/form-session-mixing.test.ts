import { describe, expect, it } from "vitest";

import { mixFormSession, paradigmMixingKey } from "@/lib/form-session-mixing";
import type { StarterCard } from "@/lib/starter-deck";

function card(lemma: string, cell: string, rank = 1): StarterCard {
  return {
    taskId: `es:${lemma}:surface:form-recall`,
    wordId: `es:${lemma}`,
    lemma,
    front: "gloss",
    descriptionKey: "gloss.key",
    back: "surface",
    frequencyRank: rank,
    paradigmCell: cell,
  };
}

describe("form-session-mixing", () => {
  it("derives tense × conjugation class for verb cells", () => {
    expect(paradigmMixingKey("hablar", "ind.pres.1sg", { hablar: { verb: "1" } })).toBe(
      "1|ind.pres",
    );
    expect(paradigmMixingKey("comer", "ind.pret.3sg", { comer: { verb: "2" } })).toBe(
      "2|ind.pret",
    );
  });

  it("reorders so no two consecutive items share a lemma", () => {
    const input = [
      card("hablar", "ind.pres.1sg", 1),
      card("hablar", "ind.pres.3sg", 2),
      card("comer", "ind.pres.1sg", 3),
      card("vivir", "ind.pres.1sg", 4),
    ];

    const mixed = mixFormSession(input);
    for (let index = 1; index < mixed.length; index += 1) {
      expect(mixed[index]!.lemma).not.toBe(mixed[index - 1]!.lemma);
    }
  });

  it("limits tense × class repeats within any window of four", () => {
    const lemmas = { hablar: { verb: "1" }, comer: { verb: "2" }, vivir: { verb: "3" }, ser: { verb: "3" } };
    const input = [
      card("hablar", "ind.pres.1sg", 1),
      card("comer", "ind.pres.3sg", 2),
      card("vivir", "ind.pres.1sg", 3),
      card("ser", "ind.pres.3sg", 4),
      card("hablar", "ind.pret.1sg", 5),
      card("comer", "ind.pret.3sg", 6),
    ];

    const mixed = mixFormSession(input, { lemmaMeta: lemmas });
    for (let start = 0; start <= mixed.length - 4; start += 1) {
      const window = mixed.slice(start, start + 4);
      const keys = window.map((entry) =>
        paradigmMixingKey(entry.lemma, entry.paradigmCell ?? "", lemmas),
      );
      const counts = new Map<string, number>();
      for (const key of keys) {
        if (!key) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      expect(Math.max(...counts.values(), 0)).toBeLessThanOrEqual(2);
    }
  });
});
