/** Contract: docs/specs/service/sentence-check.md */

/**
 * Two values, on purpose. There is no `ok`: the checker can fail a token, never
 * certify one. A third value would invite an "all green = correct" claim, and an
 * open production task has no single right answer to certify against.
 */
export type TokenVerdict = "flagged" | "unchecked";

/** Closed list — UC-017 counts these over time; an invented one voids the trend. */
export const FINDING_CATEGORIES = [
  "spelling",
  "agreement",
  "person",
  "missing-target",
] as const;

export type FindingCategory = (typeof FINDING_CATEGORIES)[number];

export type SentenceFinding = {
  /** Index into `tokens`; `-1` for a finding about the sentence as a whole. */
  tokenIndex: number;
  category: FindingCategory;
  /** i18n key under `sentenceCheck`. */
  messageKey: string;
  messageValues?: Record<string, string>;
  /** The form that would fit — only when exactly one is provable. */
  suggestion?: string;
};

export type SentenceCheckResult =
  | { status: "checked"; tokens: string[]; findings: SentenceFinding[] }
  /**
   * A first-class outcome, not a swallowed error (Constitution §4). The step
   * says so and keeps Weiter open — a checker that cannot run must not trap a
   * learner.
   */
  | { status: "unavailable"; reason: "no-lexicon" | "failed" };

export type SentenceCheckInput = {
  text: string;
  /** Lemma the learner was asked to use, if any. */
  targetLemma?: string;
  /** The word as shown to the learner — for the missing-target message. */
  targetWord?: string;
};
