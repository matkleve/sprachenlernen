/**
 * Copy for the public half. Contract: docs/specs/page/landing.md
 *
 * Positioning argument stays T-B7. What ships here is study-backed fact and
 * the paths into the account — nothing invented to fill space.
 */

export const copy = {
  header: {
    brand: "Sprachenlernen",
    signIn: "Sign in",
    signUp: "Create account",
  },
  landing: {
    eyebrow: "Evidence-driven language learning",
  /**
   * Verbatim from docs/study/README.md thesis 1, consequence column — same
   * sentence T-04's holding page used.
   */
    headline: "Progress is shown as measured competence, never as activity.",
    /**
     * First sentence of features/method-menu/content.ts `intro`, which is a
     * rendering of docs/study/README.md thesis 10.
     */
    subhead:
      "Sixty-odd ways people actually learn languages, not the handful an app happens to implement.",
    pillarsHeading: "What follows from that",
    pillars: [
      {
        /** docs/study/README.md thesis 2, consequence column */
        text: "The scheduler is a visible surface, not a black box.",
      },
      {
        /** docs/study/README.md thesis 3, consequence column */
        text: "Two equal pillars: SRS and reading/listening.",
      },
      {
        /** docs/study/README.md thesis 4, consequence column */
        text: "A level model with sub-levels per skill, plus an honest overall figure.",
      },
    ],
    primaryCta: "Create account",
    secondaryCta: "Sign in",
    languagesLink: "What the app claims for each language",
    designExplorerLink: "Compare five design directions",
  },
} as const;
