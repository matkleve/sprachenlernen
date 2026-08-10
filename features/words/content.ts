/**
 * Copy for the Words home. Contracts:
 * - docs/specs/feature/words-home.md
 * - docs/specs/page/words.md
 */

export const copy = {
  countsHeading: "Your vocabulary",
  countsCaption: "How words are held in memory right now — not a backlog.",
  held: "Held",
  shaky: "Shaky",
  newWords: "New",
  heldDescription: "Stable enough to count as known.",
  shakyDescription: "Seen but not yet secure.",
  newDescription: "Not reviewed yet.",
  horizonHeading: "Review horizon",
  horizonCaption: "When scheduled reviews fall over the next 30 days.",
  horizonDay: (offset: number) => (offset === 0 ? "Today" : `Day ${offset + 1}`),
  atlasHeading: "Vocabulary atlas",
  atlasCaption: "Frequency rank and stability for each word in your deck.",
  atlasColumns: {
    word: "Word",
    rank: "Rank",
    stability: "Stability (days)",
    status: "Status",
  },
  bucketNames: {
    held: "Held",
    shaky: "Shaky",
    new: "New",
  } as const,
  noStability: "—",
} as const;
