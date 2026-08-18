/**
 * Contract: docs/specs/service/app-texts.md
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { cardDescriptionKey } from "@/lib/description-keys";
import { loadSpanishMeaningRecallDeck, englishGlossForCard } from "@/lib/starter-deck";

const EN_SNAPSHOT = join(process.cwd(), "data/i18n/descriptions/en.json");

describe("app-texts snapshots", () => {
  it("ships an English snapshot with the fare gloss key", () => {
    expect(existsSync(EN_SNAPSHOT)).toBe(true);
    const en = JSON.parse(readFileSync(EN_SNAPSHOT, "utf8")) as Record<string, string>;
    expect(en["card.it:fare.meaning-recall.back"]).toBe("to do");
  });

  it("covers every meaning-recall back in the shipped Spanish pool", () => {
    const deck = loadSpanishMeaningRecallDeck();
    expect(deck.status).toBe("ok");
    if (deck.status !== "ok") return;

    const en = JSON.parse(readFileSync(EN_SNAPSHOT, "utf8")) as Record<string, string>;
    const missing = deck.deck.cards.filter((card) => {
      const key = cardDescriptionKey(card.wordId, "meaning-recall", "back");
      return en[key] !== englishGlossForCard(card);
    });
    expect(missing.map((card) => card.lemma)).toEqual([]);
  });
});
