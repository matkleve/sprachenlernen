import { describe, expect, it } from "vitest";

import { pickSentenceTarget } from "@/lib/exercise-recipe/sentence-target";
import type { StarterCard } from "@/lib/starter-deck";

const card = (lemma: string, rank: number): StarterCard => ({
  taskId: `es:${lemma}:meaning-recall`,
  wordId: `es:${lemma}`,
  lemma,
  front: lemma,
  descriptionKey: `card.es:${lemma}.meaning-recall.back`,
  frequencyRank: rank,
});

describe("pickSentenceTarget", () => {
  it("prefers held lemmas over the learning band", () => {
    const cards = [
      card("el", 1),
      card("casa", 50),
      card("hablar", 100),
    ];
    const target = pickSentenceTarget(cards, new Set(["hablar"]));
    expect(target?.lemma).toBe("hablar");
  });

  it("falls back to the learning band when nothing is held", () => {
    const cards = [card("el", 1), card("casa", 50)];
    const target = pickSentenceTarget(cards, new Set());
    expect(target?.lemma).toBe("casa");
  });
});
