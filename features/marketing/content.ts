// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

/**
 * Copy for the public half. Contract: docs/specs/page/landing.md
 *
 * T-B7 closed 2026-08-11: thesis 1 leads; thesis 12 time honesty in the body.
 */

import { hoursPerYear } from "@/lib/dose-band";

const HABIT_MINUTES_PER_DAY = 15;

export const copy = {
  header: {
    brand: "Sprachenlernen",
    signIn: "Sign in",
    signUp: "Create account",
    toApp: "To app",
    signOut: "Sign out",
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
    /**
     * docs/study/25-why-it-does-not-feel-productive.md C4 — thesis 12. Uses the
     * same fifteen-minute habit and `hoursPerYear` arithmetic as `/progress`.
     */
    timeHonesty: `Fifteen minutes a day, every day without missing one, is about ${Math.round(hoursPerYear(HABIT_MINUTES_PER_DAY))} hours a year — roughly a quarter of the way to B1 from a standing start. Feeling slow at that pace is arithmetic, not failure.`,
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
  },
} as const;
