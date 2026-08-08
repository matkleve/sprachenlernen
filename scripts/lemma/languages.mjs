/**
 * Per-language configuration for `scripts/build-lemma-tables.mjs`.
 *
 * Two source shapes, because no single project covers both languages:
 *
 * - **UniMorph** (Spanish) — complete Wiktionary paradigms for nouns,
 *   adjectives and verbs. Its Italian counterpart is a partial sample that is
 *   missing `essere`, `avere` and `parlare`, so it is not usable there.
 * - **Morph-it!** (Italian) — a full-form lexicon covering verbs, nouns,
 *   adjectives *and* function words.
 *
 * Both are complemented by Universal Dependencies treebanks, which supply the
 * function words a paradigm list has no entries for, and the decomposition of
 * fused forms (`del` = de + el) that only a corpus annotation records.
 */

export const LANGUAGES = {
  es: {
    name: "Spanish",
    paradigms: {
      format: "unimorph",
      url: "https://raw.githubusercontent.com/unimorph/spa/master/spa",
      file: "spa",
      encoding: "utf8",
      source: "UniMorph spa (from English Wiktionary)",
      licence: "CC BY-SA 3.0",
    },
    treebanks: [
      {
        url: "https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-GSD/master/es_gsd-ud-train.conllu",
        file: "es-gsd.conllu",
        source: "UD_Spanish-GSD",
        licence: "CC BY-SA 4.0",
      },
      {
        url: "https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/master/es_ancora-ud-train.conllu",
        file: "es-ancora.conllu",
        source: "UD_Spanish-AnCora",
        licence: "CC BY 4.0",
      },
    ],
    /** Infinitive ending → conjugation class. Longest match wins. */
    conjugations: [
      ["ar", "1"],
      ["er", "2"],
      ["ir", "3"],
      ["ír", "3"],
    ],
  },
  it: {
    name: "Italian",
    paradigms: {
      format: "morphit",
      url: "https://raw.githubusercontent.com/TraMOOC-Impleval/lemmatize_italian_data/master/morph-it_048.txt",
      file: "morph-it_048.txt",
      // Shipped as ISO-8859-1. Decoding it as UTF-8 silently mangles every
      // accented form — which is most of the interesting ones.
      encoding: "latin1",
      source: "Morph-it! 0.4.8 (Baroni & Zanchetta, Università di Bologna)",
      licence: "GNU GPL v2 or later",
    },
    treebanks: [
      {
        url: "https://raw.githubusercontent.com/UniversalDependencies/UD_Italian-ISDT/master/it_isdt-ud-train.conllu",
        file: "it-isdt.conllu",
        source: "UD_Italian-ISDT",
        licence: "CC BY-NC-SA 3.0",
      },
      {
        url: "https://raw.githubusercontent.com/UniversalDependencies/UD_Italian-VIT/master/it_vit-ud-train.conllu",
        file: "it-vit.conllu",
        source: "UD_Italian-VIT",
        licence: "CC BY-NC-SA 3.0",
      },
      {
        url: "https://raw.githubusercontent.com/UniversalDependencies/UD_Italian-ParTUT/master/it_partut-ud-train.conllu",
        file: "it-partut.conllu",
        source: "UD_Italian-ParTUT",
        licence: "CC BY-NC-SA 4.0",
      },
    ],
    // -rre verbs (porre, condurre, trarre) are historically second conjugation
    // and irregular throughout. Classing them as 2 is right etymologically, but
    // a learner meets them as exceptions rather than as a pattern.
    conjugations: [
      ["are", "1"],
      ["ere", "2"],
      ["rre", "2"],
      ["ire", "3"],
    ],
  },
};
