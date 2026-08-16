// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

/**
 * Copy for the review session. Contracts:
 * - docs/specs/feature/review-session.md
 * - docs/specs/service/review-log.md
 */

import type { ParadigmCellLabel } from "@/lib/paradigm-cells";

export const copy = {
  title: "Review",
  backToMethods: "Back to methods",
  backToWords: "Back to Words",
  unknownMethod: "That method does not exist in the catalogue.",
  notBuilt:
    "This method is listed as hosted, but its session is not built yet. The catalogue is honest about what exists.",
  prompt: "What does it mean?",
  formRecallPrompt: "Did you recall the form?",
  /**
   * The instruction lives here rather than in the card data, so the wording,
   * the placement and the language can change without regenerating the pool —
   * and so a second language does not ship 1,704 rows that say "Spanish".
   */
  formRecallInstruction: (language: string | null) =>
    language ? `Write the ${language} form.` : "Write the form.",
  /** Names the cell a form card is asking for: "he/she · present". */
  cellLabel: (cell: ParadigmCellLabel) =>
    cell.person ? `${cell.person} · ${cell.form}` : cell.form,
  flipHint: "Tap to turn",
  graded: "Saved.",
  saveError: "Your grade could not be saved.",
  saving: "Saving…",
  loading: "Preparing your session…",
  loadError: "Could not prepare your review session.",
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
  /** Must match data/methods/vocabulary.json — fast path on /words/review skips disk. */
  srsSessionName: "Spaced repetition session",
  languageLabel: (name: string) => name,
  syncing: (count: number) =>
    count === 1 ? "Syncing 1 review…" : `Syncing ${count} reviews…`,
  syncFailed: "Your grade could not be saved.",
  syncRetry: "Retry",
  report: "Report a problem with this card",
  reportDone:
    "Thanks — we will stop scheduling this card in your next session. You can finish this one.",
} as const;
