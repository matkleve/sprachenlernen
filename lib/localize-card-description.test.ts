/**
 * Contract: docs/specs/service/gloss-resolver.md
 */
import { describe, expect, it } from "vitest";

import { loadItalianMeaningRecallDeck } from "@/lib/starter-deck";
import { createGlossResolver, setGlossResolverForTests } from "@/lib/gloss-resolver";
import { resolveCardDescription } from "@/lib/localize-card-description";

describe("localize-card-description", () => {
  it("localizes meaning-recall backs for German", () => {
    const deck = loadItalianMeaningRecallDeck();
    expect(deck.status).toBe("ok");
    if (deck.status !== "ok") return;

    const fare = deck.deck.cards.find((card) => card.lemma === "fare");
    expect(fare).toBeDefined();
    if (!fare) return;

    const resolve = createGlossResolver({
      en: { "card.it:fare.meaning-recall.back": "to do" },
      de: { "card.it:fare.meaning-recall.back": "tun" },
    });
    setGlossResolverForTests(resolve);

    expect(resolveCardDescription(fare, "de")).toBe("tun");
    expect(resolve("card.it:fare.meaning-recall.back", "de", fare.back)).toBe("tun");

    setGlossResolverForTests(null);
  });
});
