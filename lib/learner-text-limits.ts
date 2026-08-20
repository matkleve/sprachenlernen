/**
 * How much text a learner may hand the app in one go. Contract:
 * docs/specs/feature/word-capture.md § Data.
 *
 * Two ceilings, because there are two stores with different physics:
 *
 *  - the **cookie** path (`EPHEMERAL_SOURCE_MAX_BODY_CHARS`, 3500) is bounded
 *    by what a `Set-Cookie` header can carry — it lives next to the serializer
 *    that enforces it, in `lib/ephemeral-source-cookie.ts`;
 *  - the **database** path is bounded here, and had no ceiling at all. A
 *    chapter is generous; the point is not to pick the perfect number but to
 *    have one, so that `content_sources.body` cannot grow without limit and
 *    the coverage parser cannot be handed a megabyte to tokenise per request.
 *
 * Enforced in three places on purpose: this module (so the message is one
 * string), the adapter (so a caller cannot skip it), and a check constraint on
 * the column (so nothing that reaches the database can bypass either). The
 * database is the one that still holds when a future adapter forgets.
 */

/** Roughly a long article or a book chapter. */
export const LEARNER_SOURCE_MAX_BODY_CHARS = 100_000;

export type LearnerTextRejection = { status: "error"; error: string };

/**
 * `null` when the text fits, a ready-to-return rejection when it does not.
 *
 * Counts UTF-16 code units, the same unit `char_length` does not use — Postgres
 * counts characters. They diverge only above the BMP (emoji, some CJK
 * extensions), where this check is the *stricter* of the two, so a value that
 * passes here always passes the constraint. The reverse would be the bug.
 */
export function rejectOversizeLearnerText(text: string): LearnerTextRejection | null {
  if (text.length <= LEARNER_SOURCE_MAX_BODY_CHARS) return null;
  return {
    status: "error",
    error: `That text is too long to save — keep it under ${LEARNER_SOURCE_MAX_BODY_CHARS.toLocaleString("en-US")} characters.`,
  };
}
