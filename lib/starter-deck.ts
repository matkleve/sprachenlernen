/**
 * Starter deck loader. Contract: docs/specs/service/session-builder.md
 */

import esMeaningRecall from "@/data/starter/es-meaning-recall.json";
import esIdenticalCognates from "@/data/starter/es-meaning-recall.cognates.json";
import esExclusions from "@/data/starter/es-meaning-recall.exclusions.json";
import itMeaningRecall from "@/data/starter/it-meaning-recall.json";
import itIdenticalCognates from "@/data/starter/it-meaning-recall.cognates.json";
import itExclusions from "@/data/starter/it-meaning-recall.exclusions.json";
import { taskTypeFromTaskId } from "@/lib/description-keys";
import { loadDescriptionSnapshotFromDisk } from "@/lib/gloss-resolver";

export type StarterCard = {
  taskId: string;
  wordId: string;
  lemma: string;
  /** What the learner is shown — a meaning or a lemma, never a whole sentence. */
  front: string;
  /** Stable gloss lookup — English source lives in app_texts / en.json snapshot. */
  descriptionKey: string;
  /**
   * Form-recall only: the surface form revealed on flip. Meaning-recall cards
   * must not carry inline English glosses (T-B11f).
   */
  back?: string;
  frequencyRank: number;
  /**
   * Which cell of the paradigm the answer sits in. Present on form-recall cards
   * only, and on the base type because the session pool is one array of both
   * kinds: a card that lost this on the way to the screen would be asked
   * without saying which form it wants. Named here, worded in
   * `lib/paradigm-cells.ts`.
   */
  paradigmCell?: string;
  /** Optional Lernwelt tags for session weighting (T-W24). */
  worlds?: string[];
};

export type StarterDeck = {
  language: string;
  taskType: string;
  cards: StarterCard[];
};

export type LoadStarterDeckResult =
  | { status: "ok"; deck: StarterDeck }
  | { status: "error"; errors: string[] };

function isStarterCard(value: unknown, taskType: string): value is StarterCard {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  const base =
    typeof row.taskId === "string" &&
    row.taskId !== "" &&
    typeof row.wordId === "string" &&
    row.wordId !== "" &&
    typeof row.lemma === "string" &&
    row.lemma !== "" &&
    typeof row.front === "string" &&
    row.front !== "" &&
    typeof row.descriptionKey === "string" &&
    row.descriptionKey !== "" &&
    typeof row.frequencyRank === "number" &&
    row.frequencyRank > 0;

  if (!base) return false;

  if (taskType === "meaning-recall") {
    return row.back === undefined;
  }

  return typeof row.back === "string" && row.back !== "";
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
    const taskType = typeof deck.taskType === "string" ? deck.taskType : "";
    deck.cards.forEach((card, index) => {
      if (!isStarterCard(card, taskType)) {
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

/** Shipped meaning-recall pool size (stage 2). */
export const SHIPPED_ES_POOL_SIZE = 2000;
export const SHIPPED_IT_POOL_SIZE = 2000;

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

export const IT_IDENTICAL_COGNATES: readonly string[] = itIdenticalCognates;

export const IT_EXCLUDED_LEMMAS: readonly string[] = Object.keys(itExclusions);

/** Shipped Spanish meaning-recall pool ({@link SHIPPED_ES_POOL_SIZE} lemmas). */
export function loadSpanishMeaningRecallDeck(): LoadStarterDeckResult {
  return validateStarterDeck(esMeaningRecall);
}

/** Shipped Italian meaning-recall pool ({@link SHIPPED_IT_POOL_SIZE} lemmas). */
export function loadItalianMeaningRecallDeck(): LoadStarterDeckResult {
  return validateStarterDeck(itMeaningRecall);
}

/**
 * Every language that actually ships a meaning-recall pool.
 *
 * A static registry rather than a directory scan, because the decks are
 * imported into the bundle and a runtime `readdir` would neither work in the
 * browser nor agree with what was bundled. Availability elsewhere in the app is
 * derived from **this** — never from a second hand-kept list, which is how a
 * language becomes selectable months before it has anything to teach.
 */
const SHIPPED_DECKS: Record<string, () => LoadStarterDeckResult> = {
  es: loadSpanishMeaningRecallDeck,
  it: loadItalianMeaningRecallDeck,
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

/** True when at least one shipped pool is not already on the learner's list. */
export function hasUnaddedShippedLanguage(learningCodes: readonly string[]): boolean {
  const learning = new Set(learningCodes);
  return availableLanguages().some((code) => !learning.has(code));
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

/** English gloss for a pool card — snapshot is source of truth after T-B11f. */
export function englishGlossForCard(card: Pick<StarterCard, "descriptionKey" | "taskId" | "wordId" | "front" | "back">): string {
  const en = loadDescriptionSnapshotFromDisk("en");
  const fromSnapshot = en[card.descriptionKey];
  if (fromSnapshot) return fromSnapshot;
  if (card.back) return card.back;
  return card.front;
}

/** True when the card is meaning-recall (inline `back` must be absent). */
export function isMeaningRecallStarterCard(card: StarterCard): boolean {
  return taskTypeFromTaskId(card.taskId) === "meaning-recall";
}
