/**
 * Copy for the Words home. Contracts:
 * - docs/specs/feature/words-home.md
 * - docs/specs/page/words.md
 */

export const copy = {
  reviewHeading: "Review",
  reviewCaption: "One session at a time — tap when you are ready.",
  countsHeading: "Your vocabulary",
  countsCaption:
    "How many starter lemmas you can recall the meaning of — not every inflected form, and not a backlog.",
  lemmaCalloutTitle: "What is a lemma?",
  lemmaCalloutBody:
    "The dictionary form of a word — correr, not corriendo. Each card here is one lemma. Held means you would still know what it means after about a week without seeing it again. Producing inflected forms is tracked separately on Progress.",
  held: "Held",
  fragile: "Fragile",
  newWords: "New",
  heldDescription:
    "You reliably recall what this lemma means — at least two spaced successes in review, stable for about a week.",
  fragileDescription:
    "You've seen the meaning in review but it is not yet stable enough to count as known.",
  newDescription: "Meaning not reviewed yet.",
  blocksHeading: "Frequency bands",
  blocksCaption:
    "How many of the most common lemmas in your starter deck you hold stably by meaning — by rank band, not the whole language yet.",
  blockLabel: (start: number, end: number) => `Ranks ${start}–${end}`,
  blockHeld: (held: number, poolSize: number) => `${held} of ${poolSize} meanings held`,
  blockHeldDescription: "Stable meaning recall — same rules as Held above.",
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
    `${count} lemmas in this band on the outer ring. ${held} meanings held stably.`,
} as const;
