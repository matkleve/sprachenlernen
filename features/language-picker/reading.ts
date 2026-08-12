import type { LanguageTile } from "@/features/language-picker/LanguagePicker";
import { readLanguageHoldings } from "@/lib/db/language-holdings";
import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";

/**
 * Builds the picker's tiles. Contract: docs/specs/page/language-picker.md
 *
 * Every language with a profile in `data/languages/` gets a tile; whether it is
 * *available* comes from whether a pool actually loads. Deriving availability
 * from the pool rather than from a list is what stops a language becoming
 * selectable months before it has anything to teach.
 */

/** Mirrors `data/languages/`. Kept here because the picker is the only reader. */
const KNOWN_LANGUAGES = ["es", "it"] as const;

export type PickerOutcome =
  | { status: "ok"; tiles: LanguageTile[] }
  | { status: "error"; error: string };

export async function readPicker(): Promise<PickerOutcome> {
  const learning = await listLearningLanguages();
  if (learning.status === "error") {
    return { status: "error", error: learning.error };
  }

  const learned = new Set(learning.languages.map((language) => language.languageCode));
  const activeCode = activeLanguageOf(learning.languages);

  const holdings = await readLanguageHoldings([...KNOWN_LANGUAGES]);
  if (holdings.status === "error") {
    return { status: "error", error: holdings.error };
  }

  const tiles = KNOWN_LANGUAGES.map((code) => {
    const deck = loadMeaningRecallDeck(code);
    const held = holdings.byCode[code];
    return {
      code,
      poolSize: deck.status === "ok" ? deck.deck.cards.length : null,
      heldCount: held?.heldCount ?? null,
      alreadyLearning: learned.has(code),
      isActive: code === activeCode,
    };
  });

  return { status: "ok", tiles };
}
