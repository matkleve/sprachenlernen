/** Contract: docs/specs/service/sentence-check.md */
import type { Analysis, LemmaTable } from "@/lib/lemma-table";

/** Same word shape as `lib/lexicon.ts` — one definition of "a word" per app. */
const WORD = /\p{L}+(?:['’]\p{L}+)*/gu;

export type SentenceToken = {
  /** As the learner typed it — what the UI renders. */
  text: string;
  /** Where it sits in the checked text, so the UI can mark it in place. */
  start: number;
  end: number;
  /** Case-folded, for table lookup. */
  normalised: string;
  /** True when the token is capitalised anywhere but sentence-initially. */
  properNounCandidate: boolean;
  /**
   * Every reading the table allows. A fused form (`del`) contributes the
   * readings of all its parts, because those words are present *together* —
   * not as alternatives. Empty means the table does not know this form.
   */
  analyses: readonly Analysis[];
};

export function normaliseToken(raw: string): string {
  return raw.toLocaleLowerCase();
}

function analysesFor(table: LemmaTable, normalised: string): readonly Analysis[] {
  const parts = table.fused[normalised];
  if (parts) return parts.flatMap((part) => table.forms[part] ?? []);
  return table.forms[normalised] ?? [];
}

export function tokeniseSentence(text: string, table: LemmaTable): SentenceToken[] {
  const matches = [...text.matchAll(WORD)];

  return matches.map((match, index) => {
    const raw = match[0];
    const normalised = normaliseToken(raw);
    const capitalised = raw !== normalised && raw[0] === raw[0]?.toLocaleUpperCase();

    return {
      text: raw,
      start: match.index,
      end: match.index + raw.length,
      normalised,
      // Sentence-initial capitals carry no information about proper nouns, so
      // index 0 never earns the exemption — otherwise every typo that happens
      // to start a sentence would go unflagged.
      properNounCandidate: capitalised && index > 0,
      analyses: analysesFor(table, normalised),
    };
  });
}

/** True when the token has at least one reading the table recognises. */
export function isKnown(token: SentenceToken): boolean {
  return token.analyses.length > 0;
}
