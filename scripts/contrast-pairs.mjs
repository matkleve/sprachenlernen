/**
 * Declarative contrast tables for scripts/check-contrast.mjs.
 * Values mirror app/globals.css — the CSS file is the source of truth for hex.
 */

/** [foreground, background, minimum ratio, what it is used for] */
export const PAIRS = [
  ["ink", "canvas", 4.5, "body text on the page"],
  ["ink", "surface", 4.5, "body text on a card"],
  ["ink", "surface-raised", 4.5, "body text on an elevated card"],
  ["muted", "canvas", 4.5, "secondary text on the page"],
  ["muted", "surface", 4.5, "secondary text on a card"],
  ["muted", "surface-raised", 4.5, "secondary text on an elevated card"],
  ["accent", "canvas", 4.5, "link text on the page"],
  ["accent", "surface", 4.5, "link text on a card"],
  ["accent", "surface-raised", 4.5, "link text on an elevated card"],
  ["accent-ink", "accent", 4.5, "label on a primary button"],
  ["accent-ink", "accent-deep", 4.5, "label on a hovered primary button"],
  ["ink", "accent-soft", 4.5, "text on an accent-tinted fill"],
  ["ink", "skill-reading-soft", 4.5, "text on reading skill tint"],
  ["ink", "skill-listening-soft", 4.5, "text on listening skill tint"],
  ["ink", "skill-speaking-soft", 4.5, "text on speaking skill tint"],
  ["ink", "skill-writing-soft", 4.5, "text on writing skill tint"],
  ["ink", "section-form-soft", 4.5, "text on form section tint"],
  ["ink", "section-vocabulary-soft", 4.5, "text on vocabulary section tint"],
  ["ink", "section-world-soft", 4.5, "text on world section tint"],
  ["ink", "section-commitments-soft", 4.5, "text on commitments section tint"],
  ["skill-reading", "skill-reading-soft", 3.0, "reading skill icon on tint"],
  ["skill-listening", "skill-listening-soft", 3.0, "listening skill icon on tint"],
  ["skill-speaking", "skill-speaking-soft", 3.0, "speaking skill icon on tint"],
  ["skill-writing", "skill-writing-soft", 3.0, "writing skill icon on tint"],
  ["section-form", "section-form-soft", 3.0, "form section border on tint"],
  ["section-vocabulary", "section-vocabulary-soft", 3.0, "vocabulary section border on tint"],
  ["section-world", "section-world-soft", 3.0, "world section border on tint"],
  ["section-commitments", "section-commitments-soft", 3.0, "commitments section border on tint"],
  ["accent", "accent-soft", 3.0, "accent icon on its own tint"],
  ["brand-calm-ink", "brand-calm", 4.5, "label on a calm brand fill"],
  ["brand-calm-ink", "brand-calm-deep", 4.5, "label on a hovered calm brand fill"],
  ["ink", "brand-earth-soft", 4.5, "text on an earth brand tint"],
  ["ink", "brand-warm-soft", 4.5, "text on a warm brand tint"],
  ["ink", "brand-calm-soft", 4.5, "text on a calm brand tint"],
  ["brand-earth", "brand-earth-soft", 3.0, "earth brand icon on tint"],
  ["brand-warm", "brand-warm-soft", 3.0, "warm brand icon on tint"],
  ["brand-calm", "brand-calm-soft", 3.0, "calm brand icon on tint"],
  ["danger", "surface", 4.5, "error text on a card"],
  ["danger-ink", "danger", 4.5, "label on a danger button"],
  ["danger-ink", "danger-deep", 4.5, "label on a hovered danger button"],
  ["ink", "danger-soft", 4.5, "text on a danger-tinted fill"],
  ["success-ink", "success", 4.5, "label on a success fill"],
  ["success-ink", "success-deep", 4.5, "label on a hovered success fill"],
  ["ink", "success-soft", 4.5, "text on a success-tinted fill"],
  ["grade-again-ink", "grade-again-soft", 4.5, "Again grade label"],
  ["grade-again-ink", "grade-again-deep", 4.5, "Again grade label on hover"],
  ["grade-hard-ink", "grade-hard-soft", 4.5, "Hard grade label"],
  ["grade-hard-ink", "grade-hard-deep", 4.5, "Hard grade label on hover"],
  ["grade-good-ink", "grade-good-soft", 4.5, "Good grade label"],
  ["grade-good-ink", "grade-good-deep", 4.5, "Good grade label on hover"],
  ["grade-easy-ink", "grade-easy-soft", 4.5, "Easy grade label"],
  ["grade-easy-ink", "grade-easy-deep", 4.5, "Easy grade label on hover"],
  ["line-strong", "surface", 3.0, "control border on a card (WCAG 1.4.11)"],
  ["line-strong", "canvas", 3.0, "control border on the page"],
  ["accent", "canvas", 3.0, "focus ring on the page"],
  ["accent", "surface", 3.0, "focus ring on a card"],
];

/**
 * Resting fill vs interaction fill — looser than text pairs.
 * [fromToken, toToken, minimum ratio, what it is used for]
 */
export const STATE_DELTA_MIN = 1.05;

export const STATE_DELTAS = [
  ["accent", "accent-deep", STATE_DELTA_MIN, "primary button hover/active fill"],
  ["danger", "danger-deep", STATE_DELTA_MIN, "danger button hover/active fill"],
  ["success", "success-deep", STATE_DELTA_MIN, "success fill hover/active"],
  ["surface", "accent-soft", STATE_DELTA_MIN, "ghost/secondary hover on a card"],
  ["brand-calm", "brand-calm-deep", STATE_DELTA_MIN, "calm brand fill hover/active"],
  ["brand-warm", "brand-warm-deep", STATE_DELTA_MIN, "warm brand fill hover/active"],
  ["brand-earth", "brand-earth-deep", STATE_DELTA_MIN, "earth brand fill hover/active"],
  ["grade-again-soft", "grade-again-deep", STATE_DELTA_MIN, "Again grade hover"],
  ["grade-hard-soft", "grade-hard-deep", STATE_DELTA_MIN, "Hard grade hover"],
  ["grade-good-soft", "grade-good-deep", STATE_DELTA_MIN, "Good grade hover"],
  ["grade-easy-soft", "grade-easy-deep", STATE_DELTA_MIN, "Easy grade hover"],
];

/**
 * Opacity washes from interaction-kernel — disabled/pending still readable.
 * [foreground, background, opacity, minimum ratio, what it is used for]
 */
export const COMPOSITE_PAIRS = [
  ["ink", "surface", 0.5, 3.0, "disabled label on a card"],
  ["ink", "canvas", 0.5, 3.0, "disabled label on the page"],
  ["muted", "surface", 0.5, 2.0, "disabled secondary label on a card"],
  ["ink", "surface", 0.7, 3.0, "pending label on a card"],
  ["ink", "canvas", 0.7, 3.0, "pending label on the page"],
  ["muted", "surface", 0.7, 3.0, "pending secondary label on a card"],
];

/** Tokens that are backgrounds/decoration only and need no contrast pair. */
export const EXEMPT = new Set([
  "line",
  "lang-es-1",
  "lang-es-2",
  "lang-es-3",
  "lang-it-1",
  "lang-it-2",
  "lang-it-3",
]);
