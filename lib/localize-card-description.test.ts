/**
 * Contract: docs/specs/service/gloss-resolver.md
 */
import { describe, expect, it } from "vitest";

import { loadItalianMeaningRecallDeck } from "@/lib/starter-deck";
import { createGlossResolver, setGlossResolverForTests } from "@/lib/gloss-resolver";
import {
  glossMapForLemmaCards,
  localizeSessionCards,
  resolveCardDescription,
} from "@/lib/localize-card-description";
import type { SessionCard } from "@/lib/session-builder";

const fareSnapshots = {
  en: { "card.it:fare.meaning-recall.back": "to do" },
  de: { "card.it:fare.meaning-recall.back": "tun" },
};

describe("localize-card-description", () => {

  it("AC-1: localizes meaning-recall backs for German", () => {
    const deck = loadItalianMeaningRecallDeck();
    expect(deck.status).toBe("ok");
    if (deck.status !== "ok") return;

    const fare = deck.deck.cards.find((card) => card.lemma === "fare");
    expect(fare).toBeDefined();
    if (!fare) return;

    const resolve = createGlossResolver(fareSnapshots);
    setGlossResolverForTests(resolve);

    expect(resolveCardDescription(fare, "de")).toBe("tun");
    expect(resolve("card.it:fare.meaning-recall.back", "de", fare.back)).toBe("tun");

    setGlossResolverForTests(null);
  });

  it("AC-3: spoken-language switch changes only description text, not task identity", () => {
    const deck = loadItalianMeaningRecallDeck();
    expect(deck.status).toBe("ok");
    if (deck.status !== "ok") return;

    const fare = deck.deck.cards.find((card) => card.lemma === "fare");
    expect(fare).toBeDefined();
    if (!fare) return;

    setGlossResolverForTests(createGlossResolver(fareSnapshots));

    const base: SessionCard = { ...fare, position: 1, total: 1 };
    const german = localizeSessionCards([base], "de")[0]!;
    const english = localizeSessionCards([base], "en")[0]!;

    expect(german.taskId).toBe(english.taskId);
    expect(german.wordId).toBe(english.wordId);
    expect(german.back).toBe("tun");
    expect(english.back).toBe("to do");

    setGlossResolverForTests(null);
  });

  it("AC-4: gap-list gloss map matches per-card resolver output", () => {
    const deck = loadItalianMeaningRecallDeck();
    expect(deck.status).toBe("ok");
    if (deck.status !== "ok") return;

    const sample = deck.deck.cards.slice(0, 12);
    setGlossResolverForTests(createGlossResolver(fareSnapshots));

    const map = glossMapForLemmaCards(sample, "de");
    for (const card of sample) {
      expect(map[card.lemma]).toBe(resolveCardDescription(card, "de"));
    }

    setGlossResolverForTests(null);
  });

  it("AC-5: batch gloss map loads each locale snapshot once", () => {
    const deck = loadItalianMeaningRecallDeck();
    expect(deck.status).toBe("ok");
    if (deck.status !== "ok") return;

    const loads: string[] = [];
    setGlossResolverForTests(
      createGlossResolver(
        {
          en: { "card.it:fare.meaning-recall.back": "to do" },
          de: { "card.it:fare.meaning-recall.back": "tun" },
        },
        { onLocaleLoad: (locale) => loads.push(locale) },
      ),
    );

    glossMapForLemmaCards(deck.deck.cards.slice(0, 20), "de");
    expect(loads).toEqual(["de", "en"]);

    setGlossResolverForTests(null);
  });
});

function resolve(key: string, spokenLanguage: string, fallback: string): string {
  const resolver = createGlossResolver(fareSnapshots);
  return resolver(key, spokenLanguage, fallback);
}
