import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { genderOfCell, paradigmCellLabel } from "@/lib/paradigm-cells";
import { loadSpanishFormRecallDeck } from "@/lib/form-recall-pool";
import type { FormRecallCard } from "@/lib/form-recall-pool";

/** Contract: docs/specs/service/form-recall-pool.md */

describe("paradigmCellLabel", () => {
  it("names a finite cell by pronoun and tense", () => {
    expect(paradigmCellLabel("ind.pres.3sg")).toEqual({
      code: "ind.pres.3sg",
      person: "he/she",
      form: "present",
    });
    expect(paradigmCellLabel("sub.impf.1pl")).toEqual({
      code: "sub.impf.1pl",
      person: "we",
      form: "imperfect subjunctive",
    });
    expect(paradigmCellLabel("cond.2sg")?.form).toBe("conditional");
    expect(paradigmCellLabel("imp.2sg")?.form).toBe("imperative");
  });

  it("names a nominal cell by gender and number, with no person", () => {
    expect(paradigmCellLabel("f.pl")).toEqual({ code: "f.pl", person: null, form: "feminine plural" });
    expect(paradigmCellLabel("pl")).toEqual({ code: "pl", person: null, form: "plural" });
    expect(paradigmCellLabel("part.past.m.sg")?.form).toBe("past participle, masculine singular");
    expect(paradigmCellLabel("inf")?.form).toBe("infinitive");
  });

  it("understands every cell the shipped lemma table uses", () => {
    // The guarantee, not the guard. A cell with no label renders nothing, so a
    // pool rebuilt onto an unlisted cell would ship prompts that never say
    // which form they want — which is exactly the defect this replaced.
    const table = JSON.parse(readFileSync("data/lemma/es.json", "utf8"));
    const cells = new Set<string>();
    for (const analyses of Object.values(table.forms as Record<string, unknown[][]>)) {
      for (const analysis of analyses) {
        if (Array.isArray(analysis) && typeof analysis[2] === "string" && analysis[2] !== "") {
          cells.add(analysis[2]);
        }
      }
    }

    expect(cells.size).toBeGreaterThan(50);
    const unlabelled = [...cells].filter((cell) => paradigmCellLabel(cell) === null);
    expect(unlabelled).toEqual([]);
  });

  it("returns null rather than echoing a code it does not understand", () => {
    expect(paradigmCellLabel("ind.plusquam.4sg")).toBeNull();
    expect(paradigmCellLabel("")).toBeNull();
    // `in` would find these on the prototype; every lookup here uses hasOwn.
    expect(paradigmCellLabel("constructor")).toBeNull();
    expect(paradigmCellLabel("toString")).toBeNull();
  });
});

describe("shipped form-recall cards", () => {
  const deck = loadSpanishFormRecallDeck();
  if (deck.status !== "ok") throw new Error("form-recall pool failed to load in test setup");
  const cards = deck.deck.cards as FormRecallCard[];

  it("stores the meaning alone, with no instruction baked into the row", () => {
    // The whole point of the split: the sentence around the meaning is the
    // card's, so its wording, placement and language can change without
    // regenerating a single row.
    const withInstruction = cards.filter((card) => /write the|—/i.test(card.front));
    expect(withInstruction).toEqual([]);
    expect(cards.find((card) => card.lemma === "ser")?.front).toBe("to be");
  });

  it("carries a cell that can be put into words for every card", () => {
    const unlabelled = cards.filter((card) => paradigmCellLabel(card.paradigmCell) === null);
    expect(unlabelled.map((card) => card.taskId)).toEqual([]);
  });

  it("never asks for a form the gloss contradicts", () => {
    // `el` glossed "the (masc.)" cannot prompt for `la`: the gloss is the
    // prompt, so a gender it names is a promise the answer has to keep.
    const contradictions = cards.filter((card) => {
      const glossGender = /\(masc\.\)/.test(card.front)
        ? "m"
        : /\(fem\.\)/.test(card.front)
          ? "f"
          : null;
      const cellGender = genderOfCell(card.paradigmCell);
      return glossGender !== null && cellGender !== null && glossGender !== cellGender;
    });

    expect(contradictions.map((card) => card.taskId)).toEqual([]);
  });
});
