/**
 * Starter deck loader. Contract: docs/specs/service/session-builder.md
 */

import esMeaningRecall from "@/data/starter/es-meaning-recall.json";

export type StarterCard = {
  taskId: string;
  wordId: string;
  lemma: string;
  front: string;
  back: string;
  frequencyRank: number;
};

export type StarterDeck = {
  language: string;
  taskType: string;
  cards: StarterCard[];
};

export type LoadStarterDeckResult =
  | { status: "ok"; deck: StarterDeck }
  | { status: "error"; errors: string[] };

function isStarterCard(value: unknown): value is StarterCard {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  const required = ["taskId", "wordId", "lemma", "front", "back", "frequencyRank"] as const;
  return required.every((key) => {
    if (key === "frequencyRank") return typeof row[key] === "number" && row[key] > 0;
    return typeof row[key] === "string" && row[key] !== "";
  });
}

export function validateStarterDeck(raw: unknown): LoadStarterDeckResult {
  const errors: string[] = [];
  if (typeof raw !== "object" || raw === null) {
    return { status: "error", errors: ["starter deck: root must be an object"] };
  }
  const deck = raw as Record<string, unknown>;
  if (typeof deck.language !== "string" || deck.language === "") {
    errors.push("language: required non-empty string");
  }
  if (typeof deck.taskType !== "string" || deck.taskType === "") {
    errors.push("taskType: required non-empty string");
  }
  if (!Array.isArray(deck.cards) || deck.cards.length === 0) {
    errors.push("cards: required non-empty array");
  } else {
    deck.cards.forEach((card, index) => {
      if (!isStarterCard(card)) {
        errors.push(`cards[${index}]: invalid starter card shape`);
      }
    });
  }
  if (errors.length > 0) {
    return { status: "error", errors };
  }
  return {
    status: "ok",
    deck: {
      language: deck.language as string,
      taskType: deck.taskType as string,
      cards: deck.cards as StarterCard[],
    },
  };
}

/** Shipped Spanish meaning-recall pool (50 lemmas). */
export function loadSpanishMeaningRecallDeck(): LoadStarterDeckResult {
  return validateStarterDeck(esMeaningRecall);
}
