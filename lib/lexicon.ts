/**
 * Everything that is per-language. Contract: docs/specs/service/lexicon.md
 *
 * The load-bearing decision here is that lemma resolution is a **lookup table,
 * not a model**. Morphological analysers (Stanza, UDPipe) are Python and far
 * too large for a browser; they are build-time tools that generate the table
 * this module reads. That is what makes resolution fast, offline, deterministic
 * and identical on every device — and it is why adding a language means
 * generating data rather than shipping code.
 *
 * The table's own shape and validation live in `lib/lemma-table.ts` — this file
 * re-exports them so `@/lib/lexicon` stays the one import a caller needs.
 */

export {
  loadLemmaTable,
  type Analysis,
  type LemmaDescription,
  type LemmaTable,
  type PartOfSpeech,
  type Resolution,
} from "./lemma-table";
import type { LemmaTable, Resolution, LemmaDescription } from "./lemma-table";

export const SCRIPTS = [
  "latin",
  "cyrillic",
  "greek",
  "arabic",
  "hebrew",
  "cjk",
  "devanagari",
] as const;
export type Script = (typeof SCRIPTS)[number];

export const MORPHOLOGIES = ["isolating", "weak", "fusional", "agglutinative"] as const;
export type Morphology = (typeof MORPHOLOGIES)[number];

/**
 * What "one word" means in this language. Declared, never inferred: getting it
 * wrong does not fail, it produces a plausible vocabulary count that means
 * nothing — and it is least visible in the languages where it is most wrong.
 * See study/STUDY-016-language-kit.md, U1.
 */
export const COUNTING_UNITS = ["form", "lemma", "segment"] as const;
export type CountingUnit = (typeof COUNTING_UNITS)[number];

export type FrequencySource = {
  source: string;
  corpus: string;
  version: string;
  licence: string;
  /** Whether the listed entries are word forms or lemmas. Not the same thing. */
  unit: "form" | "lemma";
  file: string;
};

export type LanguageProfile = {
  code: string;
  name: string;
  script: Script;
  morphology: Morphology;
  countingUnit: CountingUnit;
  frequency: FrequencySource;
  lemmaTable?: string | null;
  calibration?: { dated: string } | null;
  voices?: string[];
};

export type LoadResult = {
  profile?: LanguageProfile;
  errors: string[];
};

// --- profile validation ------------------------------------------------------

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Validates and loads. Unknown keys are ignored rather than rejected — a
 * profile carrying a hand-written `qualityTier` is not invalid, it is merely
 * ignored, because the tier is derived (see `qualityTier`).
 */
export const loadProfile = (input: unknown): LoadResult => {
  const errors: string[] = [];

  if (!isRecord(input)) return { errors: ["profile must be an object"] };

  for (const key of ["code", "name"] as const) {
    if (typeof input[key] !== "string" || input[key] === "") {
      errors.push(`${key}: required, must be a non-empty string`);
    }
  }

  const enums = [
    ["script", SCRIPTS],
    ["morphology", MORPHOLOGIES],
    ["countingUnit", COUNTING_UNITS],
  ] as const;

  for (const [key, allowed] of enums) {
    const value = input[key];
    if (value === undefined) {
      errors.push(`${key}: required — one of ${allowed.join(", ")}`);
    } else if (!(allowed as readonly string[]).includes(value as string)) {
      errors.push(`${key}: "${String(value)}" is not one of ${allowed.join(", ")}`);
    }
  }

  const frequency = input.frequency;
  if (!isRecord(frequency)) {
    errors.push("frequency: required object");
  } else {
    for (const key of ["source", "corpus", "version", "licence", "file"] as const) {
      if (typeof frequency[key] !== "string" || frequency[key] === "") {
        // Provenance travels with the data, not in a comment: a rank without it
        // cannot be compared across recalibrations.
        errors.push(`frequency.${key}: required, must be a non-empty string`);
      }
    }
    if (frequency.unit !== "form" && frequency.unit !== "lemma") {
      errors.push(`frequency.unit: required — "form" or "lemma"`);
    }
  }

  if (errors.length) return { errors };
  return { profile: input as unknown as LanguageProfile, errors: [] };
};

// --- frequency list ----------------------------------------------------------

export type FrequencyEntry = { form: string; count: number; rank: number };

/**
 * Parses `{form} {count}` lines. Rank is the entry's position, 1-based and
 * dense — deliberately taken from file order rather than recomputed from
 * counts, so the shipped file is the record of what the ranks were.
 */
export const parseFrequencyList = (text: string): FrequencyEntry[] => {
  const entries: FrequencyEntry[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const [form, rawCount] = trimmed.split(/\s+/);
    if (form === undefined || rawCount === undefined) continue;

    const count = Number(rawCount);
    if (!Number.isFinite(count)) continue;

    entries.push({ form, count, rank: entries.length + 1 });
  }

  return entries;
};

// --- quality tier ------------------------------------------------------------

export type QualityTier = "A" | "B" | "C";

/**
 * Derived from what the profile actually contains, never read from a field.
 * A tier someone can set by hand is not a quality statement.
 */
export const qualityTier = (profile: LanguageProfile): QualityTier => {
  if (!profile.lemmaTable) return "C";
  if (!profile.calibration?.dated) return "B";
  return "A";
};


// --- the lexicon -------------------------------------------------------------

export type Token = { text: string; start: number; end: number };

/**
 * A word is a run of letters, optionally joined by an internal apostrophe
 * (Italian `dell'acqua`). Digits and punctuation are not words. Unicode-aware,
 * so accented letters are letters rather than boundaries.
 */
const WORD = /\p{L}+(?:['’]\p{L}+)*/gu;

export type Lexicon = {
  profile: LanguageProfile;
  tier: QualityTier;
  tokenise: (text: string) => Token[];
  normalise: (token: string) => string;
  resolve: (form: string) => Resolution;
  describe: (lemma: string) => LemmaDescription | undefined;
  rank: (word: string) => number | undefined;
};

export const buildLexicon = (
  profile: LanguageProfile,
  entries: readonly FrequencyEntry[],
  lemmaTable?: LemmaTable,
): Lexicon => {
  const ranks = new Map<string, number>();
  for (const entry of entries) {
    // First occurrence wins: a duplicated form keeps its better rank.
    if (!ranks.has(entry.form)) ranks.set(entry.form, entry.rank);
  }

  const normalise = (token: string): string => {
    const match = token.match(WORD);
    return (match?.[0] ?? token.trim()).toLowerCase();
  };

  return {
    profile,
    tier: qualityTier(profile),

    tokenise: (text) =>
      [...text.matchAll(WORD)].map((match) => ({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      })),

    normalise,

    /**
     * An unlisted form resolves to itself and says so. It is never guessed —
     * a runtime guess would be a second, worse morphological analyser hiding
     * behind the one we deliberately moved to build time.
     *
     * `fused` is checked first and wins outright: `del` (de + el) is not a
     * competing reading with whatever a treebank annotated it as on its own,
     * it is two words present at once, and reporting it as `ambiguous` would
     * let a caller "pick one" of two things that are both true together.
     */
    resolve: (form) => {
      const normalised = normalise(form);

      const parts = lemmaTable?.fused[normalised];
      if (parts) return { kind: "fused", form: normalised, parts };

      const analyses = lemmaTable?.forms[normalised];
      if (!analyses || analyses.length === 0) return { kind: "unknown", form: normalised };
      if (analyses.length === 1) {
        const analysis = analyses[0];
        if (analysis) return { kind: "single", form: normalised, analysis };
      }
      return { kind: "ambiguous", form: normalised, analyses };
    },

    /**
     * What the lemma *is*, never how it inflects — that is `resolve`'s job.
     * Absent rather than defaulted: a lemma the table does not describe has no
     * known conjugation class, and guessing one from the ending would be the
     * runtime morphology guess this module exists to avoid.
     */
    describe: (lemma) => {
      const entry = lemmaTable?.lemmas[lemma];
      if (!entry) return undefined;
      if (typeof entry.verb === "string") return { conjugation: entry.verb };
      if (typeof entry.noun === "string") return { gender: entry.noun };
      return undefined;
    },

    /** Absent, not zero and not the list length — an unlisted word has no rank. */
    rank: (word) => ranks.get(normalise(word)),
  };
};
