import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import { loadMeaningRecallDeck, type StarterCard } from "@/lib/starter-deck";

/**
 * Turns the account's languages into the cards a caller should work with.
 * Contract: docs/specs/service/learning-languages.md
 *
 * **Two functions, and the difference is the whole point.** UC-025 splits one
 * combined daily budget across every language being learned, so scheduling has
 * to see all of them; the interface shows one at a time, so display sees the
 * active one. Collapsing these into a single "get the pool" is how the
 * combined budget quietly becomes "whatever is on screen", after which the
 * language you are not looking at stops being reviewed and decays.
 *
 * Named rather than parameterised (`forScheduling(active?)`) for the same
 * reason: a boolean at the call site is an invitation, a name is a decision.
 */

export type LearnerPool =
  | { status: "ok"; cards: StarterCard[]; languageCodes: string[] }
  /** Signed in, nothing chosen yet. Callers route to the picker. */
  | { status: "no-language" }
  | { status: "error"; error: string };

/**
 * Every language the account is learning, concatenated. Task ids carry their
 * language (`es:el:meaning-recall`), so there are no collisions across decks.
 */
export async function poolForScheduling(): Promise<LearnerPool> {
  const learning = await listLearningLanguages();
  if (learning.status === "error") return { status: "error", error: learning.error };
  if (learning.languages.length === 0) return { status: "no-language" };

  const cards: StarterCard[] = [];
  const languageCodes: string[] = [];

  for (const language of learning.languages) {
    const deck = loadMeaningRecallDeck(language.languageCode);
    // A language whose pool stopped shipping is skipped rather than fatal: one
    // broken deck must not cost the learner the languages that still work.
    if (deck.status !== "ok") continue;
    cards.push(...deck.deck.cards);
    languageCodes.push(language.languageCode);
  }

  if (cards.length === 0) {
    return { status: "error", error: "No word set could be loaded for your languages." };
  }

  return { status: "ok", cards, languageCodes };
}

/** The language in focus, and only that one. For surfaces, never for scheduling. */
export async function poolForDisplay(): Promise<LearnerPool> {
  const learning = await listLearningLanguages();
  if (learning.status === "error") return { status: "error", error: learning.error };

  const active = activeLanguageOf(learning.languages);
  if (!active) return { status: "no-language" };

  const deck = loadMeaningRecallDeck(active);
  if (deck.status !== "ok") {
    return { status: "error", error: deck.errors.join("; ") };
  }

  return { status: "ok", cards: deck.deck.cards, languageCodes: [active] };
}
