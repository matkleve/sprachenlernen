/**
 * Contract: docs/specs/service/form-practice.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildFormCellCatalog } from "@/lib/form-cell-catalog";
import { isFormCellTaskId, parseFormCellTaskId } from "@/lib/form-cell-task-id";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
import { loadLemmaTable } from "@/lib/lemma-table";
import { parseFrequencyList } from "@/lib/lexicon";

const ROOT = join(__dirname, "..");

describe("form-cell-catalog", () => {
  it("builds cell-based task ids with primary surface forms for pool lemmas", () => {
    const meaning = loadSpanishMeaningRecallDeck();
    expect(meaning.status).toBe("ok");
    if (meaning.status !== "ok") return;

    const table = loadLemmaTable(
      JSON.parse(readFileSync(join(ROOT, "data/lemma/es.json"), "utf8")),
      "es",
    ).table!;
    const frequency = parseFrequencyList(
      readFileSync(join(ROOT, "data/frequency/es.txt"), "utf8"),
    );

    const hablarMeaning = meaning.deck.cards.find((card) => card.lemma === "hablar");
    expect(hablarMeaning).toBeDefined();

    const catalog = buildFormCellCatalog({
      languageCode: "es",
      pool: meaning.deck.cards,
      lemmaTable: table,
      frequency,
    });

    const hablarPres1sg = catalog.find(
      (card) =>
        parseFormCellTaskId(card.taskId)?.lemma === "hablar" &&
        parseFormCellTaskId(card.taskId)?.cell === "ind.pres.1sg",
    );
    expect(hablarPres1sg).toBeDefined();
    expect(isFormCellTaskId(hablarPres1sg!.taskId)).toBe(true);
    expect(hablarPres1sg!.back.length).toBeGreaterThan(0);
    expect(catalog.length).toBeGreaterThan(meaning.deck.cards.length);
  });
});
