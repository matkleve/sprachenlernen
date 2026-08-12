/**
 * Starter deck loader. Contract: docs/specs/service/session-builder.md
 */

import esMeaningRecall from "@/data/starter/es-meaning-recall.json";
import esIdenticalCognates from "@/data/starter/es-meaning-recall.cognates.json";
import esExclusions from "@/data/starter/es-meaning-recall.exclusions.json";

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

/** Shipped Spanish meaning-recall pool size (stage 2). */
export const SHIPPED_ES_POOL_SIZE = 2000;

/**
 * Longest admissible card back. Mirrors `MAX_GLOSS_CHARS` in
 * `scripts/build-starter-deck.mjs`; the deck test below is what makes the
 * mirror hold, since a script loosened past this ships cards the gate rejects.
 */
export const MAX_GLOSS_CHARS = 60;

/**
 * Lemmas whose English gloss is legitimately the Spanish word itself, and
 * lemmas that never enter the pool. Both are shared with
 * `scripts/build-starter-deck.mjs` through their data files, so the gate and
 * the generator enforce one list each rather than two that drift — the build
 * script is not part of `npm run verify`, so without this the lists would be
 * checked only when somebody happened to regenerate.
 */
export const ES_IDENTICAL_COGNATES: readonly string[] = esIdenticalCognates;

export const ES_EXCLUDED_LEMMAS: readonly string[] = Object.keys(esExclusions);

/** Shipped Spanish meaning-recall pool ({@link SHIPPED_ES_POOL_SIZE} lemmas). */
export function loadSpanishMeaningRecallDeck(): LoadStarterDeckResult {
  return validateStarterDeck(esMeaningRecall);
}

/**
 * Every language that actually ships a meaning-recall pool.
 *
 * A static registry rather than a directory scan, because the decks are
 * imported into the bundle and a runtime `readdir` would neither work in the
 * browser nor agree with what was bundled. Availability elsewhere in the app is
 * derived from **this** — never from a second hand-kept list, which is how a
 * language becomes selectable months before it has anything to teach.
 *
 * Italian is deliberately absent: `data/frequency/it.txt` and `data/lemma/it.json`
 * ship, but no pool can be built yet. See
 * docs/specs/service/starter-deck.second-language.md.
 */
const SHIPPED_DECKS: Record<string, () => LoadStarterDeckResult> = {
  es: loadSpanishMeaningRecallDeck,
};

export function availableLanguages(): readonly string[] {
  return Object.keys(SHIPPED_DECKS);
}

export function isLanguageAvailable(languageCode: string): boolean {
  // `in` walks the prototype chain, so `"constructor" in SHIPPED_DECKS` is true
  // and would make `Object` look like a shipped deck. Both server actions here
  // take an unvalidated string, so this guard is the boundary.
  return Object.hasOwn(SHIPPED_DECKS, languageCode);
}

/**
 * Loads the meaning-recall pool for a language. Returns an error outcome rather
 * than throwing for an unknown language — a caller holding a stale language
 * code is a data condition, not a programming fault, and the error surfaces
 * exist for exactly this.
 */
export function loadMeaningRecallDeck(languageCode: string): LoadStarterDeckResult {
  const load = isLanguageAvailable(languageCode) ? SHIPPED_DECKS[languageCode] : undefined;
  if (!load) {
    return { status: "error", errors: [`no meaning-recall pool ships for "${languageCode}"`] };
  }
  return load();
}
