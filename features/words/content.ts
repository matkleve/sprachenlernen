/**
 * Copy for the Words home. Contracts:
 * - docs/specs/feature/words-home.md
 * - docs/specs/page/words.md
 */

export const copy = {
  countsHeading: "Your vocabulary",
  countsCaption: "How words are held in memory right now — not a backlog.",
  held: "Held",
  fragile: "Fragile",
  newWords: "New",
  heldDescription:
    "You'd still recall it after about a week without seeing it again — at least two spaced successes in review.",
  fragileDescription: "Seen in review but not yet stable enough to count as known.",
  newDescription: "Not reviewed yet.",
  horizonHeading: "Review horizon",
  horizonCaption: "When scheduled reviews fall over the next 30 days.",
  horizonDay: (offset: number) => (offset === 0 ? "Today" : `Day ${offset + 1}`),
  atlasHeading: "Vocabulary atlas",
  atlasCaption: "Frequency rank and stability for each word in your deck.",
  atlasTruncated: (shown: number, total: number) =>
    `Showing the ${shown} most frequent of ${total} words in your deck.`,
  atlasColumns: {
    word: "Word",
    rank: "Rank",
    stability: "Stability (days)",
    status: "Status",
  },
  bucketNames: {
    held: "Held",
    fragile: "Fragile",
    new: "New",
    mature: "Mature",
  } as const,
  noStability: "—",
} as const;
