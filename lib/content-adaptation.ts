/**
 * Level-targeted adaptation helpers. Contract: docs/specs/service/content-adaptation.md
 */

export const ADAPTATION_TIERS = ["T0", "T1", "T2", "T3"] as const;
export type AdaptationTier = (typeof ADAPTATION_TIERS)[number];

export const CACHEABLE_ADAPTATION_TIERS = ["T2", "T3"] as const;
export type CacheableAdaptationTier = (typeof CACHEABLE_ADAPTATION_TIERS)[number];

export type AdaptationCacheKey = {
  sourceId: string;
  targetLevel: string;
  languageCode: string;
  tier: CacheableAdaptationTier;
  promptVersion: string;
};

export type PersonalAdaptationCacheKey = {
  sourceHash: string;
  heldLemmaSetHash: string;
  targetLevel: string;
  languageCode: string;
  promptVersion: string;
};

export const COMFORTABLE_COVERAGE_MIN = 95;

export const buildAdaptationCacheKey = (input: AdaptationCacheKey): string =>
  [
    input.sourceId,
    input.languageCode,
    input.targetLevel,
    input.tier,
    input.promptVersion,
  ].join(":");

export const buildPersonalAdaptationCacheKey = (input: PersonalAdaptationCacheKey): string =>
  [
    input.sourceHash,
    input.heldLemmaSetHash,
    input.languageCode,
    input.targetLevel,
    "T3",
    input.promptVersion,
  ].join(":");

export const adaptationLabelForLevel = (targetLevel: string): string =>
  `Adapted for ${targetLevel} · not the original article`;

export const meetsAdaptationCoverage = (coveragePercent: number): boolean =>
  coveragePercent >= COMFORTABLE_COVERAGE_MIN;
