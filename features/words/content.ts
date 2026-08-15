/**
 * Copy for the Words home. Contracts:
 * - docs/specs/feature/words-home.md
 * - docs/specs/page/words.md
 */

export const copy = {
  reviewHeading: "Review",
  reviewCaption: "One session at a time — tap when you are ready.",
  countsHeading: "Your vocabulary",
  countsCaption: "How words are held in memory right now — not a backlog.",
  held: "Held",
  fragile: "Fragile",
  newWords: "New",
  heldDescription:
    "You'd still recall it after about a week without seeing it again — at least two spaced successes in review.",
  fragileDescription: "Seen in review but not yet stable enough to count as known.",
  newDescription: "Not reviewed yet.",
  blocksHeading: "Frequency bands",
  blocksCaption:
    "How many of the most common words in your starter deck you hold stably — by rank band, not the whole language yet.",
  blockLabel: (start: number, end: number) => `Ranks ${start}–${end}`,
  blockHeld: (held: number, poolSize: number) => `${held} of ${poolSize} held`,
  blockHeldDescription: "Stable enough to count as known — same rules as Held above.",
  horizonHeading: "Review horizon",
  horizonCaption: "When scheduled reviews fall over the next 30 days.",
  horizonDay: (offset: number) => (offset === 0 ? "Today" : `Day ${offset + 1}`),
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
  orbitHeading: "Your vocabulary orbit",
  orbitCaption:
    "Common words sit near the center. Dark dashes light up as you hold them — each ring drifts on its own.",
  orbitAriaLabel: "Vocabulary progress shown as concentric rings",
  orbitShowList: "Show list",
  orbitListTitle: "All words",
  orbitListCaption: "Frequency rank and status for every word in your deck.",
  orbitAggregateLabel: (start: number, end: number, count: number) =>
    `${count} words, ranks ${start}–${end}`,
  orbitAggregateHeading: (start: number, end: number) => `Ranks ${start}–${end}`,
  orbitAggregateBody: (count: number, held: number) =>
    `${count} words in this band on the outer ring. ${held} held stably.`,
  orbitDetailRankLabel: "Frequency rank",
  orbitDetailStabilityLabel: "Stability",
  orbitDetailBandLabel: "Band",
  orbitDetailBandCaption: (start: number, end: number) => `Ranks ${start}–${end}`,
  orbitDetailWordsInBandLabel: "Words in band",
  orbitDetailHeldSummary: (held: number, total: number) => `${held} of ${total} held`,
} as const;
