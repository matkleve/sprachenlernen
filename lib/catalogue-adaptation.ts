/**
 * Catalogue T2 adaptation with coverage validator loop + cache.
 * Contract: docs/specs/service/content-adaptation.md (T-CI3)
 */
import type { AdaptationCacheStore, CachedAdaptation } from "@/lib/adaptation-cache";
import {
  ADAPTATION_TIERS,
  buildAdaptationCacheKey,
  meetsAdaptationCoverage,
  type AdaptationCacheKey,
  type CacheableAdaptationTier,
} from "@/lib/content-adaptation";
import { computeCoverage, sourceText, type Source } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";

export const DEFAULT_T2_PROMPT_VERSION = "v1";

export type AdaptationRewriteInput = {
  originalBody: string;
  targetLevel: string;
  languageCode: string;
  heldLemmas: ReadonlySet<string>;
};

export type AdaptationRewriteFn = (input: AdaptationRewriteInput) => Promise<string>;

export type CatalogueAdaptationSuccess = {
  status: "ready";
  adapted: boolean;
  body: string;
  coveragePercent: number;
  targetLevel: string;
  tier: (typeof ADAPTATION_TIERS)[number];
  cacheKey: string;
  fromCache: boolean;
};

export type CatalogueAdaptationFailure = {
  status: "failed";
  reason: string;
  cacheKey: string;
  targetLevel: string;
};

export type CatalogueAdaptationResult = CatalogueAdaptationSuccess | CatalogueAdaptationFailure;

export type AdaptCatalogueSourceInput = {
  source: Source;
  targetLevel: string;
  tier?: CacheableAdaptationTier;
  promptVersion?: string;
  lexicon: Lexicon;
  heldLemmas: ReadonlySet<string>;
  rewrite: AdaptationRewriteFn;
  cache: AdaptationCacheStore;
};

const toCacheEntry = (
  key: AdaptationCacheKey,
  cacheKey: string,
  adaptedBody: string,
  coveragePercent: number,
  cachedAt: string,
): CachedAdaptation => ({
  cacheKey,
  sourceId: key.sourceId,
  languageCode: key.languageCode,
  targetLevel: key.targetLevel,
  tier: key.tier,
  promptVersion: key.promptVersion,
  adaptedBody,
  coveragePercent,
  cachedAt,
});

export async function adaptCatalogueSource(
  input: AdaptCatalogueSourceInput,
): Promise<CatalogueAdaptationResult> {
  const tier = input.tier ?? "T2";
  const promptVersion = input.promptVersion ?? DEFAULT_T2_PROMPT_VERSION;
  const keyInput: AdaptationCacheKey = {
    sourceId: input.source.id,
    languageCode: input.source.languageCode,
    targetLevel: input.targetLevel,
    tier,
    promptVersion,
  };
  const cacheKey = buildAdaptationCacheKey(keyInput);

  const cached = input.cache.get(cacheKey);
  if (cached) {
    return {
      status: "ready",
      adapted: true,
      body: cached.adaptedBody,
      coveragePercent: cached.coveragePercent,
      targetLevel: input.targetLevel,
      tier,
      cacheKey,
      fromCache: true,
    };
  }

  const originalBody = sourceText(input.source);
  if (!originalBody.trim()) {
    return { status: "failed", reason: "empty-source-body", cacheKey, targetLevel: input.targetLevel };
  }

  const originalCoverage = computeCoverage(originalBody, input.lexicon, input.heldLemmas);
  if (meetsAdaptationCoverage(originalCoverage.coveragePercent)) {
    return {
      status: "ready",
      adapted: false,
      body: originalBody,
      coveragePercent: originalCoverage.coveragePercent,
      targetLevel: input.targetLevel,
      tier: "T0",
      cacheKey,
      fromCache: false,
    };
  }

  let lastBody = "";
  let lastCoverage = originalCoverage.coveragePercent;

  for (let attempt = 0; attempt < 2; attempt++) {
    lastBody = await input.rewrite({
      originalBody,
      targetLevel: input.targetLevel,
      languageCode: input.source.languageCode,
      heldLemmas: input.heldLemmas,
    });

    const coverage = computeCoverage(lastBody, input.lexicon, input.heldLemmas);
    lastCoverage = coverage.coveragePercent;
    if (meetsAdaptationCoverage(lastCoverage)) {
      const cachedAt = new Date().toISOString();
      input.cache.set(
        toCacheEntry(keyInput, cacheKey, lastBody, lastCoverage, cachedAt),
      );
      return {
        status: "ready",
        adapted: true,
        body: lastBody,
        coveragePercent: lastCoverage,
        targetLevel: input.targetLevel,
        tier,
        cacheKey,
        fromCache: false,
      };
    }
  }

  return {
    status: "failed",
    reason: `coverage-below-min:${lastCoverage}`,
    cacheKey,
    targetLevel: input.targetLevel,
  };
}

export function readCachedAdaptationBody(
  cache: AdaptationCacheStore,
  key: AdaptationCacheKey,
): string | undefined {
  return cache.get(buildAdaptationCacheKey(key))?.adaptedBody;
}
