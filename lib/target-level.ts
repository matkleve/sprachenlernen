/**
 * Target CEFR band for catalogue adaptation — proxy until T-B3 skill-tier mapping.
 * Contract: docs/specs/service/content-adaptation.md
 */

export const CATALOGUE_ADAPTATION_LEVELS = ["A2", "B1"] as const;
export type CatalogueAdaptationLevel = (typeof CATALOGUE_ADAPTATION_LEVELS)[number];

/** v1 proxy: pool size → band until skill-tier → CEFR mapping ships (T-B3). */
export function inferTargetLevelFromHeldCount(heldLemmaCount: number): CatalogueAdaptationLevel {
  if (heldLemmaCount < 1200) return "A2";
  return "B1";
}
