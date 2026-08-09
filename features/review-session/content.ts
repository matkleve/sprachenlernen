/**
 * Copy for the review session opener. Contract: docs/specs/service/review-log.md
 * (persistence); full session FSM follows in T-B1.
 */

export const copy = {
  title: "Review",
  backToMethods: "Back to methods",
  unknownMethod: "That method does not exist in the catalogue.",
  notBuilt:
    "This method is listed as hosted, but its session is not built yet. The catalogue is honest about what exists.",
  prompt: "What is on the card?",
  graded: "Saved — your grade is in the review log.",
  saveError: "Could not save your grade. Try again.",
  saving: "Saving…",
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
  demoTaskId: "demo-srs-session-task-1",
  demoCard: {
    front: "el gato",
    back: "the cat",
  },
} as const;
