/**
 * T3 personal rewrite for learner uploads with consent.
 * Contract: docs/specs/service/content-adaptation.md (T-CI5)
 */
import type { AdaptationCacheStore, CachedAdaptation } from "@/lib/adaptation-cache";
import { hashHeldLemmaSet, hashSourceText } from "@/lib/adaptation-hash";
import type { AdaptationRewriteFn } from "@/lib/catalogue-adaptation";
import { DEFAULT_T3_PROMPT_VERSION } from "@/lib/catalogue-adaptation";
import {
  ADAPTATION_TIERS,
  buildPersonalAdaptationCacheKey,
  meetsAdaptationCoverage,
  type AdaptationTier,
} from "@/lib/content-adaptation";
import { computeCoverage } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";

export type LearnerAdaptationSuccess = {
  status: "ready";
  adapted: boolean;
  body: string;
  originalBody: string;
  coveragePercent: number;
  targetLevel: string;
  tier: AdaptationTier;
  cacheKey: string;
  fromCache: boolean;
};

export type LearnerAdaptationFailure = {
  status: "failed";
  reason: string;
  cacheKey: string;
  targetLevel: string;
};

export type LearnerAdaptationResult = LearnerAdaptationSuccess | LearnerAdaptationFailure;

export type AdaptLearnerTextInput = {
  originalBody: string;
  languageCode: string;
  targetLevel: string;
  lexicon: Lexicon;
  heldLemmas: ReadonlySet<string>;
  rewrite: AdaptationRewriteFn;
  cache: AdaptationCacheStore;
  processingConsent: boolean;
  promptVersion?: string;
};

const toCacheEntry = (
  cacheKey: string,
  sourceHash: string,
  languageCode: string,
  targetLevel: string,
  promptVersion: string,
  adaptedBody: string,
  coveragePercent: number,
  cachedAt: string,
): CachedAdaptation => ({
  cacheKey,
  sourceId: sourceHash,
  languageCode,
  targetLevel,
  tier: "T3",
  promptVersion,
  adaptedBody,
  coveragePercent,
  cachedAt,
});

export async function adaptLearnerText(
  input: AdaptLearnerTextInput,
): Promise<LearnerAdaptationResult> {
  const promptVersion = input.promptVersion ?? DEFAULT_T3_PROMPT_VERSION;
  const trimmed = input.originalBody.trim();
  if (!trimmed) {
    return {
      status: "failed",
      reason: "empty-source-body",
      cacheKey: "",
      targetLevel: input.targetLevel,
    };
  }

  const originalCoverage = computeCoverage(trimmed, input.lexicon, input.heldLemmas);
  if (meetsAdaptationCoverage(originalCoverage.coveragePercent)) {
    return {
      status: "ready",
      adapted: false,
      body: trimmed,
      originalBody: trimmed,
      coveragePercent: originalCoverage.coveragePercent,
      targetLevel: input.targetLevel,
      tier: "T0",
      cacheKey: "",
      fromCache: false,
    };
  }

  if (!input.processingConsent) {
    return {
      status: "ready",
      adapted: false,
      body: trimmed,
      originalBody: trimmed,
      coveragePercent: originalCoverage.coveragePercent,
      targetLevel: input.targetLevel,
      tier: "T0",
      cacheKey: "",
      fromCache: false,
    };
  }

  const sourceHash = hashSourceText(trimmed);
  const heldLemmaSetHash = hashHeldLemmaSet(input.heldLemmas);
  const cacheKey = buildPersonalAdaptationCacheKey({
    sourceHash,
    heldLemmaSetHash,
    languageCode: input.languageCode,
    targetLevel: input.targetLevel,
    promptVersion,
  });

  const cached = input.cache.get(cacheKey);
  if (cached) {
    return {
      status: "ready",
      adapted: true,
      body: cached.adaptedBody,
      originalBody: trimmed,
      coveragePercent: cached.coveragePercent,
      targetLevel: input.targetLevel,
      tier: "T3",
      cacheKey,
      fromCache: true,
    };
  }

  let lastBody = "";
  let lastCoverage = originalCoverage.coveragePercent;

  for (let attempt = 0; attempt < 2; attempt++) {
    lastBody = await input.rewrite({
      originalBody: trimmed,
      targetLevel: input.targetLevel,
      languageCode: input.languageCode,
      heldLemmas: input.heldLemmas,
      tier: "T3",
    });

    const coverage = computeCoverage(lastBody, input.lexicon, input.heldLemmas);
    lastCoverage = coverage.coveragePercent;
    if (meetsAdaptationCoverage(lastCoverage)) {
      const cachedAt = new Date().toISOString();
      input.cache.set(
        toCacheEntry(
          cacheKey,
          sourceHash,
          input.languageCode,
          input.targetLevel,
          promptVersion,
          lastBody,
          lastCoverage,
          cachedAt,
        ),
      );
      return {
        status: "ready",
        adapted: true,
        body: lastBody,
        originalBody: trimmed,
        coveragePercent: lastCoverage,
        targetLevel: input.targetLevel,
        tier: "T3",
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

export function readCachedLearnerAdaptationBody(
  cache: AdaptationCacheStore,
  input: {
    originalBody: string;
    languageCode: string;
    targetLevel: string;
    heldLemmas: ReadonlySet<string>;
    promptVersion?: string;
  },
): string | undefined {
  const promptVersion = input.promptVersion ?? DEFAULT_T3_PROMPT_VERSION;
  const cacheKey = buildPersonalAdaptationCacheKey({
    sourceHash: hashSourceText(input.originalBody),
    heldLemmaSetHash: hashHeldLemmaSet(input.heldLemmas),
    languageCode: input.languageCode,
    targetLevel: input.targetLevel,
    promptVersion,
  });
  return cache.get(cacheKey)?.adaptedBody;
}

export const LEARNER_ADAPTATION_TIERS = ADAPTATION_TIERS;
