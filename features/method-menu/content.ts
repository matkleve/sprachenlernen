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

export const copy = {
  title: "Ways of practising",
  intro:
    "Sixty-odd ways people actually learn languages, not the handful an app happens to implement. Say where you are and the list narrows to what you can do there — a method you cannot perform right now has an effect of zero, so it is not offered at all rather than offered and greyed out.",
  contextLabel: "Where are you right now?",
  anyContext: "Any situation",
  fittingCount: "What you can do here",
  wholeCatalogue: "The whole catalogue",
  nothingFits:
    "Nothing in the catalogue can be done in this situation. That is a gap in what has been written down, not advice to do nothing — and it is better said than padded around.",
  unknownContext:
    "That is not a situation this app ships, so nothing was filtered. The whole catalogue is below.",
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
  timeLabel: "How much time?",
  customiseLabel: "Customise situation",
  customiseHint:
    "Pick one value per row. The list updates when every row has a choice and a time budget is set.",
  skillLabel: "What do you want to train?",
  anySkill: "Any skill",
  savedPresetsLabel: "Your saved situations",
  savePresetLabel: "Name this situation",
  savePresetPlaceholder: "e.g. Morning commute",
  savePresetAction: "Save",
  removeSavedPreset: "Remove",
  startUnavailable: "Starting a session is not built yet",
  startSession: "Start",
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

export const dimensionOrder = Object.keys(CONTEXT_DIMENSIONS) as Dimension[];
