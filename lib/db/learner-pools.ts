import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import { loadFormRecallDeck } from "@/lib/form-recall-pool";
import { loadMeaningRecallDeck, type StarterCard } from "@/lib/starter-deck";

/**
 * Turns the account's active language into the cards a caller should work
 * with. Contract: docs/specs/service/learning-languages.md
 *
 * **One function, not two.** An earlier version had a second one,
 * `poolForScheduling`, that concatenated every learning language's cards so a
 * session could draw from all of them — the mechanism behind a combined
 * cross-language daily budget. UC-025 rejected that budget outright: a
 * session belongs to exactly one language, always, the same one the interface
 * is showing. Once scheduling and display agree on that, there is nothing left
 * for a second function to do differently.
 */

export type LearnerPool =
  | { status: "ok"; cards: StarterCard[]; languageCodes: string[] }
  /** Signed in, nothing chosen yet. Callers route to the picker. */
  | { status: "no-language" }
  | { status: "error"; error: string };

/** The language in focus, and only that one — every card a session or a
 * display surface should use. */
export async function poolForActiveLanguage(): Promise<LearnerPool> {
  const learning = await listLearningLanguages();
  if (learning.status === "error") return { status: "error", error: learning.error };

  const active = activeLanguageOf(learning.languages);
  if (!active) return { status: "no-language" };

  const deck = loadMeaningRecallDeck(active);
  if (deck.status !== "ok") {
    return { status: "error", error: deck.errors.join("; ") };
  }

  const cards: StarterCard[] = [...deck.deck.cards];
  const formDeck = loadFormRecallDeck(active);
  if (formDeck.status === "ok") {
    cards.push(...formDeck.deck.cards);
  }

  return { status: "ok", cards, languageCodes: [active] };
}
