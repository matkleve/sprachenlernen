/**
 * Copy for the method menu. Contract: docs/specs/page/method-menu.md
 *
 * The evidence sentences are a rendering of the grade table in
 * docs/study/README.md, which owns what a grade means. A grade's meaning
 * changing is an edit there and this file follows — the reverse would put a
 * normative sentence in two places and let them drift.
 */

import type { Dimension, EvidenceGrade, Section } from "@/lib/method-catalogue";
import { CONTEXT_DIMENSIONS } from "@/lib/method-catalogue";
import { isEndless, type TimeBudget } from "@/lib/time-scale";

/** Human label for a time-budget step — lives here for review and later i18n. */
export function formatTimeBudget(budget: TimeBudget): string {
  if (isEndless(budget)) return "Endless";
  if (budget === 60) return "1 hour";
  if (budget === 90) return "1½ hours";
  if (budget === 120) return "2 hours";
  if (budget === 180) return "3 hours";
  if (budget === 240) return "4 hours";
  if (budget === 360) return "6 hours";
  if (budget === 480) return "8 hours";
  if (budget === 720) return "12 hours";
  if (budget === 1440) return "1 day";
  if (budget >= 60) return `${budget / 60} hours`;
  return `${budget} min`;
}

export const copy = {
  title: "Ways of practising",
  intro:
    "Sixty-odd ways people actually learn languages. Three questions narrow the list — how long you have, what you want to train, and how much energy you have. Refine only if you need to.",
  timeLabel: "How much time do you have?",
  timeScaleHint: "Short steps at the start — drag right for longer, up to a day or endless",
  skillLabel: "What do you want to train?",
  anySkill: "Any skill",
  energyLabel: "How much energy do you have?",
  anyEnergy: "Any energy",
  refineLabel: "Refine further",
  refineHint: "Only if the list still feels too broad — hands, voice, or whether you need your eyes.",
  refineAny: "Does not matter",
  refineDimension: {
    hands: "Hands",
    voice: "Voice",
    eyes: "Eyes",
  },
  nothingFits:
    "Nothing in the catalogue fits those filters. Try more time, a different skill, or fewer refinements.",
  catalogueUnavailable:
    "The method catalogue could not be read, so nothing below is being hidden from you — there is nothing to show. What went wrong:",
  card: {
    trains: "Trains",
    needs: "Needs",
    needsNothing: "Nothing in particular",
    duration: "Takes",
    openEnded: "Open-ended",
    intensity: "Effort",
    doesNotDo: "What it does not do",
    properties: "Method properties",
  },
  hosted: "The app runs this",
  notHosted: "You do this yourself — the app does not run it",
  hostedShort: "App runs this",
  notHostedShort: "Off-app",
  startSession: "Start",
  sessionNotBuilt:
    "The app will run this method here once its session is built. For now, read what it does and try it off-app if you can.",
  backToMethods: "Back to methods",
  methodNotFound: "No method with that name exists in the catalogue.",
  minutes: "min",
  or: "or",
  /** Alternative requirement sets: any one of them suffices. */
  eitherOr: "or",
} as const;

export const sections: Record<Section, string> = {
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
  form: "Grammar and form",
  vocabulary: "Vocabulary",
  world: "Out in the world",
  commitments: "Standing commitments",
};

export const evidence: Record<EvidenceGrade, string> = {
  A: "Evidence A — replicated, with the effect shown outside the lab",
  B: "Evidence B — well supported, with limits",
  C: "Evidence C — plausible and widespread, but thinly evidenced",
  D: "Evidence D — a product decision, not a finding",
};

export const evidenceShort: Record<EvidenceGrade, string> = {
  A: "Evidence A",
  B: "Evidence B",
  C: "Evidence C",
  D: "Evidence D",
};

/**
 * The intensity anchors, closed on 2026-08-09 and owned by
 * `lib/method-catalogue.ts`'s INTENSITY. Restated as a sentence fragment that
 * follows "Effort:" rather than as a new scale — a second scale is a second
 * thing to calibrate.
 */
export const intensity: Record<1 | 2 | 3, string> = {
  1: "can be done tired or distracted",
  2: "needs attention, but not effort",
  3: "you will be tired afterwards",
};

/**
 * What each context value means in words. Naming the enum the catalogue
 * already ships — not a new vocabulary. The keys are exhaustive over
 * CONTEXT_DIMENSIONS, which the type below enforces at compile time, so a new
 * dimension value cannot ship without a name for it.
 */
type DimensionLabels = {
  [K in Dimension]: Record<(typeof CONTEXT_DIMENSIONS)[K][number], string>;
};

export const dimensionValues: DimensionLabels = {
  eyes: { free: "eyes free", occupied: "eyes busy" },
  hands: { free: "both hands", one: "one hand", none: "no hands" },
  voice: { aloud: "speaking aloud", quiet: "speaking quietly", none: "no voice" },
  writingSurface: {
    paper: "paper",
    keyboard: "a keyboard",
    touch: "a touchscreen",
    none: "nothing to write on",
  },
  sound: { speaker: "a speaker", headphones: "headphones", silent: "no sound" },
  attention: {
    full: "full attention",
    divided: "divided attention",
    fragmented: "fragmented attention",
  },
  company: {
    alone: "alone",
    speakers: "people who speak the language",
    others: "other people",
  },
};

export const refineOptions = {
  hands: [
    { value: "none", label: "Hands-free" },
    { value: "one", label: "One hand" },
    { value: "free", label: "Both hands" },
  ],
  voice: [
    { value: "none", label: "Silent" },
    { value: "quiet", label: "Quiet voice" },
    { value: "aloud", label: "Speaking aloud" },
  ],
  eyes: [
    { value: "free", label: "Eyes on screen" },
    { value: "occupied", label: "Eyes elsewhere" },
  ],
} as const;

export const dimensionOrder = Object.keys(CONTEXT_DIMENSIONS) as Dimension[];
