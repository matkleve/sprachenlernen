/**
 * Form-recall starter pool loader. Contract:
 * docs/specs/service/form-recall-pool.md
 */

import esFormRecall from "@/data/starter/es-form-recall.json";
import itFormRecall from "@/data/starter/it-form-recall.json";
import {
  validateStarterDeck,
  type LoadStarterDeckResult,
  type StarterCard,
} from "@/lib/starter-deck";

export type FormRecallCard = StarterCard & {
  surfaceForm: string;
  paradigmCell: string;
};

function isFormRecallCard(value: unknown): value is FormRecallCard {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  const base =
    typeof row.taskId === "string" &&
    row.taskId.endsWith(":form-recall") &&
    typeof row.wordId === "string" &&
    typeof row.lemma === "string" &&
    typeof row.front === "string" &&
    typeof row.back === "string" &&
    typeof row.frequencyRank === "number" &&
    row.frequencyRank > 0;
  return (
    base &&
    typeof row.surfaceForm === "string" &&
    row.surfaceForm !== "" &&
    typeof row.paradigmCell === "string" &&
    row.paradigmCell !== "" &&
    row.back === row.surfaceForm
  );
}

export function validateFormRecallDeck(raw: unknown): LoadStarterDeckResult {
  const base = validateStarterDeck(raw);
  if (base.status === "error") return base;
  if (base.deck.taskType !== "form-recall") {
    return { status: "error", errors: ["taskType must be form-recall"] };
  }

  const errors: string[] = [];
  base.deck.cards.forEach((card, index) => {
    if (!isFormRecallCard(card)) {
      errors.push(`cards[${index}]: invalid form-recall card shape`);
    }
  });

  if (errors.length > 0) return { status: "error", errors };
  return { status: "ok", deck: { ...base.deck, cards: base.deck.cards as FormRecallCard[] } };
}

/** Shipped Spanish form-recall pool — one surface form per meaning-recall lemma where possible. */
export function loadSpanishFormRecallDeck(): LoadStarterDeckResult {
  return validateFormRecallDeck(esFormRecall);
}

/** Shipped Italian form-recall pool — one surface form per meaning-recall lemma where possible. */
export function loadItalianFormRecallDeck(): LoadStarterDeckResult {
  return validateFormRecallDeck(itFormRecall);
}

const SHIPPED_FORM_DECKS: Record<string, () => LoadStarterDeckResult> = {
  es: loadSpanishFormRecallDeck,
  it: loadItalianFormRecallDeck,
};

export function loadFormRecallDeck(languageCode: string): LoadStarterDeckResult {
  const load = Object.hasOwn(SHIPPED_FORM_DECKS, languageCode)
    ? SHIPPED_FORM_DECKS[languageCode]
    : undefined;
  if (!load) {
    return { status: "error", errors: [`no form-recall pool ships for "${languageCode}"`] };
  }
  return load();
}

/**
 * Meaning-recall task id for the Word that owns this card — staging checks this
 * Task's bucket before scheduling a form-recall sibling.
 */
export function meaningRecallTaskIdFor(card: Pick<StarterCard, "wordId">): string {
  return `${card.wordId}:meaning-recall`;
}

export function isFormRecallTaskId(taskId: string): boolean {
  return taskId.endsWith(":form-recall");
}

export function isMeaningRecallTaskId(taskId: string): boolean {
  return taskId.endsWith(":meaning-recall");
}
