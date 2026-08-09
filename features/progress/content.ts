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

  emptyState:
    "You have not reviewed anything yet, so nothing below has a value. That is the honest starting state, not a failure.",
  startReview: "Start a review session",

  gapHeading: "What is missing, and why",
  gapBody:
    "The signal that would carry a level is estimated vocabulary size, and it is not built. It works by extrapolating what you know across a language's frequency list, and the shipped pool is fifty words — an estimate drawn from that would be a claim about Spanish made from one session. The mapping from vocabulary size to a level also still needs calibrating per language. Both are named in the spec rather than approximated here.",
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
