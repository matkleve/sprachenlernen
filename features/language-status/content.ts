/**
 * Copy for the language status page. Contract: docs/specs/page/language-status.md
 *
 * The per-tier sentences are a rendering of the quality-tier table in
 * docs/specs/service/lexicon.md, which owns what a tier means. If a tier's
 * meaning changes, it changes there first and this file follows — the reverse
 * would put a normative sentence in two places and let them drift.
 */

import type { QualityTier } from "@/lib/lexicon";

export const copy = {
  title: "Language support — what we can honestly measure in each language",
  intro:
    "This page is about our data, not your learning — it is not where you choose a language. Every figure below is derived from what actually ships for that language, never from a field anyone can set. A course bootstrapped from generated material is normal; being told which parts rest on what is not.",
  tableCaption: "What the app claims for each shipped language, and why",
  columns: {
    language: "Language",
    tier: "Tier",
    claims: "What it claims",
    notClaims: "What it does not claim",
    nextTier: "For the next tier",
    frequency: "Frequency data",
  },
  empty:
    "No language profile loaded. The app ships its languages as data in data/languages/, so this page is empty rather than wrong when none is present.",
  invalidTitle: "Profiles that did not load",
  invalidCaption: "Files in data/languages/ that failed validation, and why",
  invalidColumns: { file: "File", errors: "Why it was refused" },
  invalidNote:
    "These are listed rather than skipped. A profile dropped in silence is indistinguishable from a language nobody has added yet.",
} as const;

export type TierCopy = {
  /** One sentence for what this tier claims. */
  claims: string;
  /** One sentence for what it does not — never omitted, at any tier. */
  notClaims: string;
  /** The artefact the next tier needs, or null at the top tier. */
  nextTier: string | null;
};

export const tierCopy: Record<QualityTier, TierCopy> = {
  C: {
    claims: "Cards and reading work, ranked by a frequency list.",
    notClaims:
      "At this tier no level is claimed: without a word list there is no defined unit to count, so every skill reads 'not measured'.",
    nextTier: "a word list",
  },
  B: {
    claims: "A level, reported with a widened uncertainty band.",
    notClaims:
      "Not a precise level — the band stays wide until the anchors are calibrated against this language rather than borrowed.",
    nextTier: "a dated calibration",
  },
  A: {
    claims: "A level, reported with the normal uncertainty band.",
    notClaims:
      "Not certainty — calibration narrows the band, it never removes it.",
    nextTier: null,
  },
};

export const noNextTier = "Nothing — this is the top tier.";
