/**
 * Principled gap selection for listen-and-fill methods.
 * Contract: docs/specs/service/material-unit.md (T-MU2)
 */
import type { Lexicon, Token } from "@/lib/lexicon";
import type { PartOfSpeech } from "@/lib/lemma-table";

const FUNCTION_POS = new Set<PartOfSpeech>([
  "det",
  "adp",
  "pron",
  "conj",
  "part",
  "num",
]);

export type GapFillToken = {
  text: string;
  gapped: boolean;
};

export type GapFillLine = {
  sentence: string;
  tokens: GapFillToken[];
  gappedIndices: number[];
};

export type GapSelectionOptions = {
  /** Share of eligible content tokens to gap — default 0.5 */
  maxGapRatio?: number;
  /** Prefer gapping content words the learner holds in writing (partial dictation). */
  heldLemmas?: ReadonlySet<string>;
};

const lemmasForToken = (form: string, lexicon: Lexicon): readonly string[] => {
  const resolution = lexicon.resolve(form);
  if (resolution.kind === "unknown") return [];
  if (resolution.kind === "single") return [resolution.analysis.lemma];
  if (resolution.kind === "ambiguous") return resolution.analyses.map((analysis) => analysis.lemma);
  return resolution.parts.flatMap((part) => lemmasForToken(part, lexicon));
};

const tokenMatchesHeldLemma = (
  form: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): boolean => lemmasForToken(form, lexicon).some((lemma) => heldLemmas.has(lemma));

export function isContentWord(form: string, lexicon: Lexicon): boolean {
  const resolution = lexicon.resolve(form);
  if (resolution.kind === "single") {
    return !FUNCTION_POS.has(resolution.analysis.pos);
  }
  if (resolution.kind === "ambiguous") {
    return resolution.analyses.some((analysis) => !FUNCTION_POS.has(analysis.pos));
  }
  // Unknown forms: long tokens are more likely content than clitics.
  return lexicon.normalise(form).length > 2;
}

/** True when gaps hit every second token index — the forbidden alternating rule. */
export function isAlternatingOnlyGaps(tokenCount: number, gapIndices: readonly number[]): boolean {
  if (gapIndices.length === 0) return false;
  const gapSet = new Set(gapIndices);
  const alternating = Array.from({ length: tokenCount }, (_, index) => index).filter(
    (index) => index % 2 === 1,
  );
  return (
    gapIndices.length === alternating.length &&
    alternating.every((index) => gapSet.has(index))
  );
}

export function selectGapIndices(
  tokens: readonly Token[],
  lexicon: Lexicon,
  options?: GapSelectionOptions,
): number[] {
  let candidates = tokens
    .map((token, index) => ({ index, token: token.text }))
    .filter(({ token }) => isContentWord(token, lexicon));

  if (candidates.length === 0) return [];

  if (options?.heldLemmas && options.heldLemmas.size > 0) {
    const heldCandidates = candidates.filter(({ token }) =>
      tokenMatchesHeldLemma(token, lexicon, options.heldLemmas!),
    );
    if (heldCandidates.length > 0) candidates = heldCandidates;
  }

  const maxGaps = Math.max(
    1,
    Math.ceil(candidates.length * (options?.maxGapRatio ?? 0.5)),
  );

  // Space gaps across content words — not every second surface token.
  const step = Math.max(1, Math.floor(candidates.length / maxGaps));
  const gaps: number[] = [];
  for (let i = 0; i < candidates.length && gaps.length < maxGaps; i += step) {
    gaps.push(candidates[i]!.index);
  }

  if (gaps.length === 0) {
    gaps.push(candidates[Math.floor(candidates.length / 2)]!.index);
  }

  return gaps;
}

export function buildGapFillLine(
  sentence: string,
  lexicon: Lexicon,
  options?: GapSelectionOptions,
): GapFillLine {
  const tokens = lexicon.tokenise(sentence);
  const gappedIndices = selectGapIndices(tokens, lexicon, options);
  const gapSet = new Set(gappedIndices);

  return {
    sentence,
    gappedIndices,
    tokens: tokens.map((token, index) => ({
      text: token.text,
      gapped: gapSet.has(index),
    })),
  };
}

/** Display string with `___` blanks — used in prompts and legacy recipe text. */
export function formatGappedSentence(line: GapFillLine): string {
  return line.tokens
    .map((token) => {
      if (!token.gapped) return token.text;
      const punct = token.text.match(/[.!?]+$/)?.[0] ?? "";
      return punct ? `___${punct}` : "___";
    })
    .join(" ");
}

export function parseGapFillConfig(
  config: Record<string, unknown>,
): GapFillLine | null {
  const sentence = typeof config.sentence === "string" ? config.sentence : "";
  const rawTokens = config.tokens;
  if (!sentence || !Array.isArray(rawTokens)) return null;

  const tokens = rawTokens
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const text = typeof entry.text === "string" ? entry.text : "";
      const gapped = entry.gapped === true;
      if (!text) return null;
      return { text, gapped };
    })
    .filter((token): token is GapFillToken => token !== null);

  if (tokens.length === 0) return null;

  const gappedIndices = tokens
    .map((token, index) => (token.gapped ? index : -1))
    .filter((index) => index >= 0);

  return { sentence, tokens, gappedIndices };
}
