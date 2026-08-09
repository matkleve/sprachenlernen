/**
 * Copy for the review session opener. Contract: docs/specs/page/method-detail.md
 * (session route); full T-B1 spec follows.
 */

export const copy = {
  title: "Review",
  backToMethods: "Back to methods",
  unknownMethod: "That method does not exist in the catalogue.",
  notBuilt:
    "This method is listed as hosted, but its session is not built yet. The catalogue is honest about what exists.",
  prompt: "What is on the card?",
  graded: "Graded — full scheduling arrives with the review log.",
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
  demoCard: {
    front: "el gato",
    back: "the cat",
  },
} as const;
