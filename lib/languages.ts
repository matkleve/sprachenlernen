/**
 * How a language is named on screen. One source for every surface.
 *
 * There were two before this file: `languageNames` in the picker's `content.ts`
 * and `LANGUAGE_DISPLAY_NAMES` in the review-session action. Adding a language
 * meant editing both, and the profile page reached into the picker's copy to
 * borrow one of them — a feature importing another feature's `content.ts`,
 * which is the moment something belongs in one place instead.
 *
 * **The endonym is not authored here.** It lives in `data/languages/<code>.json`
 * as `name`, and a test asserts this map agrees with the shipped profiles, so
 * the duplication cannot drift. The English name has no home in the data and is
 * authored here until a profile field exists for it.
 */

export type LanguageLabel = {
  /** The language's own name — always the primary label on screen. */
  endonym: string;
  /** For a reader who does not recognise the endonym yet. */
  english: string;
  /**
   * Decorative flag glyph for the shell switcher circle only — never the
   * primary identifier (profile.md, language-picker.md).
   */
  flag: string;
};

const LABELS: Record<string, LanguageLabel> = {
  es: { endonym: "Español", english: "Spanish", flag: "🇪🇸" },
  it: { endonym: "Italiano", english: "Italian", flag: "🇮🇹" },
};

/**
 * Falls back to the code rather than throwing: an unknown code on screen is a
 * cosmetic problem, and a page that dies because a language was added to the
 * database before this map is a real one.
 */
export function languageLabel(code: string): LanguageLabel {
  return LABELS[code] ?? { endonym: code, english: code, flag: "🌐" };
}

/** The codes this map knows — for the test that pins it to the shipped data. */
export function labelledLanguages(): readonly string[] {
  return Object.keys(LABELS);
}
