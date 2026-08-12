import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";

/**
 * Contract: docs/specs/service/form-practice.md
 *
 * Nothing in that spec is implemented. What this file guards is its
 * **premises** — the facts about the shipped lemma table that its design
 * decisions rest on. If the table is regenerated and the ambiguity vanishes, or
 * the noise is cleaned, or the cell inventory changes shape, then the spec is
 * arguing about a world that no longer exists and should be reread. A spec
 * whose grounds moved silently is worse than no spec.
 */

type Analysis = [lemma: string, pos: string, cell: string];

const table = JSON.parse(
  readFileSync(join(process.cwd(), "data/lemma/es.json"), "utf8"),
) as { forms: Record<string, Analysis[]> };

const analyses = (form: string): Analysis[] =>
  Array.isArray(table.forms[form]) ? table.forms[form] : [];

describe("form-practice premises — the shipped Spanish table", () => {
  it("carries a paradigm cell on nearly every form", () => {
    const forms = Object.values(table.forms).filter((a) => Array.isArray(a) && a.length);
    const withCell = forms.filter((a) => a.some((entry) => entry[2]));
    expect(withCell.length / forms.length).toBeGreaterThan(0.95);
  });

  it("is ambiguous in BOTH directions, which is what rules out one question shape", () => {
    // form → cell
    expect(analyses("hablamos").map((a) => a[2]).sort()).toEqual([
      "ind.pres.1pl",
      "ind.pret.1pl",
    ]);

    // cell → form. The spec's design turns on this being common, not rare.
    const inverse = new Map<string, Set<string>>();
    for (const [form, list] of Object.entries(table.forms)) {
      if (!Array.isArray(list)) continue;
      for (const [lemma, pos, cell] of list) {
        if (pos !== "verb" || !cell) continue;
        const key = `${lemma}|${cell}`;
        (inverse.get(key) ?? inverse.set(key, new Set()).get(key)!).add(form);
      }
    }
    const multi = [...inverse.values()].filter((forms) => forms.size > 1).length;
    const share = multi / inverse.size;

    // 28.2% when the spec was written. A wide band: the claim is "this is
    // structural", not "this is exactly 0.282".
    expect(share).toBeGreaterThan(0.2);
    expect(share).toBeLessThan(0.4);
  });

  it("still contains the noise a grader would otherwise accept", () => {
    // Each of these would make a wrong answer pass. They are quarantine
    // candidates for the inverse index the spec is blocked on — and this test
    // fails, usefully, the day someone cleans them.
    const estar3pl = Object.entries(table.forms)
      .filter(([, list]) =>
        Array.isArray(list) && list.some(([l, , c]) => l === "estar" && c === "ind.pres.3pl"),
      )
      .map(([form]) => form);
    expect(estar3pl).toContain("estan"); // unaccented

    const haber3sg = Object.entries(table.forms)
      .filter(([, list]) =>
        Array.isArray(list) && list.some(([l, , c]) => l === "haber" && c === "ind.pres.3sg"),
      )
      .map(([form]) => form);
    expect(haber3sg).toContain("a"); // not a verb form at all
  });

  it("keeps the accent rule computable — both members of each pair are present", () => {
    // The rule "forgive an accent unless the unaccented string is itself a form
    // of the same lemma" is only decidable if both members ship.
    const pairs: [string, string][] = [
      ["hablaré", "hablare"],
      ["hablo", "habló"],
      ["hablé", "hable"],
    ];
    for (const [accented, bare] of pairs) {
      expect(analyses(accented).length).toBeGreaterThan(0);
      expect(analyses(bare).length).toBeGreaterThan(0);
    }
  });

  it("would multiply the Task count far past what the current read path survives", () => {
    const deck = loadSpanishMeaningRecallDeck();
    const pool = new Set(deck.status === "ok" ? deck.deck.cards.map((c) => c.lemma) : []);

    const cells = new Set<string>();
    for (const list of Object.values(table.forms)) {
      if (!Array.isArray(list)) continue;
      for (const [lemma, pos, cell] of list) {
        if (pos === "verb" && cell && pool.has(lemma)) cells.add(`${lemma}|${cell}`);
      }
    }

    // The spec's read-path warning is arithmetic, so it can be asserted.
    expect(cells.size).toBeGreaterThan(5000);
    const tasks = cells.size + pool.size;
    expect(Math.ceil(tasks / 100)).toBeGreaterThan(50); // batched requests per page load
  });
});
