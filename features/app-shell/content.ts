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
  destinations: {
    methods: "Methods",
    words: "Words",
    progress: "Progress",
  },
  signOut: "Sign out",
} as const;

export const holding = {
  words: {
    title: "Words",
    /** ADR-0009's own description of the destination, so nothing is invented here. */
    intent:
      "Everything about your vocabulary: what is due now, what is held, what is shaky. Reviewing is one of the things you do here, not what this place is.",
  },
  progress: {
    title: "Progress",
    intent:
      "The level model drilled down to its signals, the dose ledger, and an honest 'not measured' wherever that is the truth.",
    notYet:
      "Not built yet. It arrives with the vocabulary estimate and the level display (T-B3), and it will have to render 'nothing measured yet' with dignity, because that is the state of every new account.",
  },
} as const;
