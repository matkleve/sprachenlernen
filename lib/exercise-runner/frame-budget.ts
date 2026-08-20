/**
 * Practice runner vertical frame budget — mirrors `app/globals.css` tokens.
 * Contract: docs/reviews/design/DR-043-exercise-mobile-fit-frame.md
 *
 * Mobile session box = `--height-review-session` (100svh − shell float reserves).
 * Only reading-profile steps may scroll inside the body zone.
 */

/** Chrome heights in rem — must stay aligned with globals.css @theme tokens. */
export const PRACTICE_FRAME_CHROME_REM = {
  /** Mobile: step strip + stop — no hero image */
  mobileHeader: 2.75,
  /** Mobile: segmented progress + nav row + safe padding */
  mobileFooter: 3.75,
  /** Runner column gaps between chrome zones on mobile */
  mobileGaps: 0.75,
  /** Desktop hero belt */
  desktopHero: 5,
  /** Desktop progress block (bar + label, no timer) */
  desktopProgress: 2.25,
  /** Desktop footer (nav above primary) */
  desktopFooter: 5.5,
  /** Shell float top reserve (typical single-line title) */
  shellFloatTop: 5.5,
  /** Shell float bottom reserve (pill + version + gap) */
  shellFloatBottom: 5.5,
} as const;

/** Short-step content slots — body zone budget on a typical phone. */
export const SHORT_STEP_SLOTS_REM = {
  introBlock: 3.5,
  prepRow: 2.75,
  promptLead: 2,
  fieldThreeRows: 5.5,
  footerHint: 1.25,
} as const;

/**
 * Remaining body zone on mobile after runner chrome (not shell).
 * `sessionHeightRem` = computed `--height-review-session` ÷ root font size.
 */
export function practiceMobileBodyBudgetRem(sessionHeightRem: number): number {
  const chrome =
    PRACTICE_FRAME_CHROME_REM.mobileHeader +
    PRACTICE_FRAME_CHROME_REM.mobileFooter +
    PRACTICE_FRAME_CHROME_REM.mobileGaps;
  return Math.max(0, sessionHeightRem - chrome);
}

/**
 * Typical iPhone body budget: 100svh ≈ 52.75rem at 16px, minus shell ~11rem,
 * minus runner chrome ~7.75rem → ~30rem task zone.
 */
export function typicalMobileBodyBudgetRem(): number {
  const session =
    52.75 - PRACTICE_FRAME_CHROME_REM.shellFloatTop - PRACTICE_FRAME_CHROME_REM.shellFloatBottom;
  return practiceMobileBodyBudgetRem(session);
}

/** Whether a prepare checklist fits a given body budget (rem). */
export function prepareChecklistFitsBudget(
  bodyBudgetRem: number,
  prepRowCount: number,
  introLines = 3,
): boolean {
  const need =
    SHORT_STEP_SLOTS_REM.introBlock +
    prepRowCount * SHORT_STEP_SLOTS_REM.prepRow +
    (introLines > 2 ? 0.5 : 0);
  return need <= bodyBudgetRem;
}

/** Whether a prepare checklist fits the short-profile budget on mobile. */
export function prepareChecklistFitsMobileBudget(prepRowCount: number, introLines = 3): boolean {
  return prepareChecklistFitsBudget(typicalMobileBodyBudgetRem(), prepRowCount, introLines);
}
