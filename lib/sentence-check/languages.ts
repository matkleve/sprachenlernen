/**
 * The per-language knowledge the lemma table does not carry. Contract:
 * docs/specs/service/sentence-check.md
 *
 * Kept as data, in one file, for the reason `lib/lexicon.ts` gives: a language
 * is added by writing data, not by branching code. A language with no entry
 * here simply gets no pronoun and no exemption rules — it loses findings, never
 * gains wrong ones.
 */

/** Person + number as the lemma table writes it in a verb cell: `1sg`, `3pl`, … */
export type PersonCell = "1sg" | "2sg" | "3sg" | "1pl" | "2pl" | "3pl";

export type LanguageRules = {
  /** Explicit subject pronoun → the person the verb after it must carry. */
  subjectPronouns: Readonly<Record<string, PersonCell>>;
  /**
   * Determiner forms that may legitimately precede a noun of the *other*
   * gender. Spanish `el agua`, `un área`: a feminine singular noun beginning
   * with a stressed a-sound takes the masculine singular article.
   *
   * We cannot hear stress, so the test is "begins with a or ha" — deliberately
   * wider than the real rule. It therefore stays silent on a genuine `el amiga`.
   * That is the correct direction to be wrong in: doubt is silence.
   */
  masculineArticleBeforeFeminine: {
    determiners: readonly string[];
    nounPrefixes: readonly string[];
  } | null;
};

const SPANISH: LanguageRules = {
  subjectPronouns: {
    yo: "1sg",
    tú: "2sg",
    tu: "2sg",
    vos: "2sg",
    él: "3sg",
    ella: "3sg",
    usted: "3sg",
    nosotros: "1pl",
    nosotras: "1pl",
    vosotros: "2pl",
    vosotras: "2pl",
    ellos: "3pl",
    ellas: "3pl",
    ustedes: "3pl",
  },
  masculineArticleBeforeFeminine: {
    determiners: ["el", "un"],
    nounPrefixes: ["a", "ha"],
  },
};

const ITALIAN: LanguageRules = {
  subjectPronouns: {
    io: "1sg",
    tu: "2sg",
    lui: "3sg",
    lei: "3sg",
    egli: "3sg",
    ella: "3sg",
    esso: "3sg",
    essa: "3sg",
    noi: "1pl",
    voi: "2pl",
    loro: "3pl",
    essi: "3pl",
    esse: "3pl",
  },
  // Italian's article alternation (il/lo, un/uno) turns on the following
  // sound, not on gender — so it never produces a gender clash to exempt.
  masculineArticleBeforeFeminine: null,
};

const RULES: Readonly<Record<string, LanguageRules>> = {
  es: SPANISH,
  it: ITALIAN,
};

export function languageRules(languageCode: string): LanguageRules | undefined {
  return RULES[languageCode];
}
