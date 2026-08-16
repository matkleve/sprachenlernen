// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

import { DOSE_BAND_SOURCE } from "@/lib/dose-band";

/**
 * Copy for the progress destination. Contract: docs/specs/page/progress.md
 *
 * The status sentences render docs/study/03-level-model.md's status table,
 * which owns what each status means. If "not measured" ever changes meaning it
 * changes there and this file follows — the same one-owner rule the language
 * status page follows for quality tiers.
 */

import type { Skill, SignalId, SkillStatus } from "@/lib/level-model";

export const copy = {
  title: "Where you stand",
  intro:
    "This page shows what has actually been measured about your language, and says so plainly where nothing has been. A level you have not been tested on is not a level, so you will not find one here yet.",

  skillsHeading: "Your four skills",
  skillsCaption: "Each skill, its measurement status, and what would measure it",
  skillColumns: {
    skill: "Skill",
    status: "Status",
    route: "What would measure it",
  },

  overallHeading: "Overall level",
  overallWithheld:
    "There is no overall level, and inventing one would be the whole problem. The overall level is the second-lowest of the skills that count, and today no skill counts — so there is nothing to take the second-lowest of.",

  signalsHeading: "What is actually recorded",
  signalsIntro:
    "These are the seven quantities the level model is built from. A signal has a value and a status; only a skill can have a level, so you will not see a letter and a number next to any of these.",
  signalsCaption: "The seven layer-1 signals and whether anything has been recorded for each",
  signalColumns: {
    signal: "Signal",
    status: "Status",
    value: "Value",
  },
  noData: "Nothing recorded yet",
  hasData: "Recorded",
  noValue: "—",

  stabilityValue: (days: number, taskCount: number) =>
    `${days.toFixed(1)} days, averaged over ${taskCount} ${taskCount === 1 ? "card" : "cards"} you have reviewed`,

  vocabularyValue: (held: number, poolSize: number) =>
    `${held} of ${poolSize} starter words held stably — not extrapolated to the language`,

  formMasteryValue: (held: number, poolSize: number) =>
    `${held} of ${poolSize} starter forms held stably — separate from vocabulary size`,

  emptyState:
    "You have not reviewed anything yet, so nothing below has a value. That is the honest starting state, not a failure.",
  startReview: "Start a review session",

  doseHeading: "What a level costs",
  doseIntro:
    "The hours below are the denominator nobody in this category publishes. They are guided learning hours from a standing start — the total to reach that level, not the cost of the step.",
  doseCaption: "Cumulative guided hours per level, and what a daily habit reaches",
  doseColumns: {
    level: "Level",
    hours: "Guided hours",
    atFifteen: "At 15 minutes a day",
  },
  doseHours: (min: number, max: number) => `${min}–${max} hours`,
  doseYears: (minYears: number, maxYears: number) =>
    `${minYears.toFixed(1)}–${maxYears.toFixed(1)} years`,
  doseHabit: (hours: number) =>
    `Fifteen minutes a day, every day without missing one, is about ${Math.round(hours)} hours a year.`,
  doseBorrowed:
    DOSE_BAND_SOURCE.calibratedFor === null
      ? `These figures are borrowed and uncalibrated: ${DOSE_BAND_SOURCE.name}, English-derived institutional estimates used here for a different language pair. Treat them as an order of magnitude, not a measurement. A guided hour is also instructed time with feedback, which app minutes only partly are — so the comparison flatters the app rather than the reverse.`
      : `These figures come from ${DOSE_BAND_SOURCE.name}, calibrated for ${DOSE_BAND_SOURCE.calibratedFor}. A guided hour is instructed time with feedback, which app minutes only partly are.`,
  doseNoNumerator:
    "There is no line here for the hours you have practised, because the app does not count them. It records how long each card took, which is time inside review sessions and nothing else — and roughly a third to a half of the practice this app recommends happens away from it. A total built only from card time would be wrong by an unknowable amount, and dividing it into the hours above would make the error look precise.",

  gapHeading: "What is missing, and why",
  gapBody:
    "A language-wide vocabulary estimate and any CEFR level it would feed are not built. Extrapolation needs a frequency-ranked pool large enough to estimate a boundary rank — the shipped starter set is two thousand words. The anchor table that maps vocabulary to a level is also still uncalibrated for this language pair. Both are named here rather than approximated.",
} as const;

export const skillNames: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
};

export const statusNames: Record<SkillStatus, string> = {
  measured: "Measured",
  uncertain: "Uncertain — few data yet",
  "not-measured": "Not measured",
  "not-in-profile": "Not part of your profile",
};

export const signalNames: Record<SignalId, string> = {
  "vocabulary-size": "Estimated vocabulary size",
  "form-mastery": "Form mastery",
  "recall-stability": "Recall stability",
  "lexical-coverage": "Lexical coverage",
  "response-time": "Response time on correct recall",
  "success-by-difficulty": "Success by task difficulty",
  "production-quality": "Production quality",
};

/**
 * What would have to start arriving for a skill to become measurable. Phrased
 * as the practice the learner would do, not as the signal's name, because
 * "lexical coverage has no data" is not a route anybody can act on.
 */
export const routeToMeasuring: Record<Skill, string> = {
  reading: "Reading texts whose words this app knows — none are shipped yet.",
  listening:
    "Nothing yet. No signal in the level model is assigned to listening, which is a gap in the model rather than in your practice.",
  speaking: "Speaking that the app records and scores — not built.",
  writing: "Free writing or dictation the app can score — not built.",
};
