/**
 * Review session deck filter. Contract: docs/specs/service/session-builder.md,
 * UC-078.
 */

export const REVIEW_DECKS = ["meaning", "form", "mixed"] as const;

export type ReviewDeck = (typeof REVIEW_DECKS)[number];

export function parseReviewDeck(value: string | undefined | null): ReviewDeck {
  if (value === "meaning" || value === "form" || value === "mixed") {
    return value;
  }
  return "mixed";
}
