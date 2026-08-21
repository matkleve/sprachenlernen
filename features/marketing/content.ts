// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

/**
 * Copy for the public half. Contract: docs/specs/page/landing.md
 *
 * T-B7 closed 2026-08-11: thesis 1 in pillars; thesis 12 time honesty in body.
 * Owner 2026-08-18: headline study/38 I — choice + checkable progress, not thesis-1 negation.
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
     * Owner 2026-08-18, study/38 I — thesis 13 (learner chooses method) +
     * measurable progress without anti-competitor tone.
     */
    headline: "You choose how you practise — we show whether you're really getting somewhere.",
    /**
     * Method catalogue with evidence grades ([21](STUDY-019-method-catalogue-and-context.md));
     * thesis 10 scale without "not the handful an app implements".
     */
    subhead:
      "Sixty-plus evidence-backed practice methods. You pick what fits today — we show what it's doing for your level.",
    /**
     * docs/study/STUDY-023-why-it-does-not-feel-productive.md C4 — thesis 12.
     */
    timeHonesty: `Fifteen minutes a day, every day without missing one, is about ${Math.round(hoursPerYear(HABIT_MINUTES_PER_DAY))} hours a year — roughly a quarter of the way to B1 from a standing start. Feeling slow at that pace is arithmetic, not failure.`,
    pillarsHeading: "How we measure it",
    pillars: [
      {
        /** docs/study/README.md thesis 1, consequence column — body, not headline */
        text: "Progress is shown as measured competence, never as activity.",
      },
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
