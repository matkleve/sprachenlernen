/**
 * Copy for the review session. Contracts:
 * - docs/specs/feature/review-session.md
 * - docs/specs/service/review-log.md
 */

export const copy = {
  title: "Review",
  backToMethods: "Back to methods",
  backToWords: "Back to Words",
  unknownMethod: "That method does not exist in the catalogue.",
  notBuilt:
    "This method is listed as hosted, but its session is not built yet. The catalogue is honest about what exists.",
  prompt: "What does it mean?",
  flipHint: "Tap to turn",
  graded: "Saved.",
  saveError: "Could not save your grade. Try again.",
  saving: "Saving…",
  loading: "Preparing your session…",
  loadError: "Could not prepare your session. Try again.",
  emptySession: "Nothing to review right now.",
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
  progress: (position: number, total: number) => `${position} of ${total}`,
  completeTitle: "Session complete",
  completeBody: (count: number) =>
    count === 1 ? "You reviewed 1 card." : `You reviewed ${count} cards.`,
  startReview: "Start review",
  languageLabel: (name: string) => name,
  syncing: (count: number) =>
    count === 1 ? "Syncing 1 review…" : `Syncing ${count} reviews…`,
  syncFailed: "1 review couldn't save",
  syncRetry: "Retry",
} as const;
