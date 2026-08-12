/**
 * Copy for the app shell. Contract: docs/specs/feature/app-shell.md
 *
 * The three destination names are ADR-0009's, verbatim. "Words" in particular
 * is load-bearing and must not drift towards "Cards" or "Review": the whole
 * decision was to name the destination for the material rather than for one
 * method performed on it.
 */

export const copy = {
  navLabel: "Destinations",
  mobileNavLabel: "Switch destination",
  account: "Account",
  switchLanguage: "Switch learning language",
  switchError: "Could not switch language. Nothing changed.",
  currentLanguage: (endonym: string) => `${endonym}, current learning language`,
  active: "Active",
  addLanguage: "Add a language",
  standing: (held: number, poolSize: number) =>
    `${held} of ${poolSize} starter words held stably`,
  viewProgress: "View on Progress",
  backTo: (destination: string) => `Back to ${destination}`,
  destinations: {
    methods: "Methods",
    words: "Words",
    progress: "Progress",
  },
} as const;

export const holding = {
  words: {
    title: "Words",
    /** ADR-0009's own description of the destination, so nothing is invented here. */
    intent:
      "Everything about your vocabulary: what is due now, what is held, what is fragile. Reviewing is one of the things you do here, not what this place is.",
  },
  // Progress is no longer a holding page — T-B3 built it. Its copy lives in
  // features/progress/content.ts and its tab title comes from the destination
  // name above, so the nav and the tab cannot drift apart.
} as const;
