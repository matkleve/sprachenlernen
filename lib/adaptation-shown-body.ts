/**
 * Server-only shown-body resolution for catalogue + learner sources.
 * Kept separate from adaptation-preview.ts so client bundles avoid node:crypto.
 * Contract: docs/specs/service/content-adaptation.md (T-CI4, T-CI5)
 */
import type { AdaptationCacheStore } from "@/lib/adaptation-cache";
import { computeGapSet } from "@/lib/content-gap";
import {
  adaptationLabelForLevel,
  meetsAdaptationCoverage,
} from "@/lib/content-adaptation";
import {
  deliveryGateForCoverage,
  startEnabledForGate,
} from "@/lib/adaptation-delivery";
import {
  resolveCatalogueShownBody,
  type CatalogueShownBody,
} from "@/lib/adaptation-preview";
import { computeCoverage, sourceText, type Source } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import { readCachedLearnerAdaptationBody } from "@/lib/learner-adaptation";
import { inferTargetLevelFromHeldCount } from "@/lib/target-level";

export function resolveLearnerShownBody(
  source: Source,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  cache: AdaptationCacheStore,
  processingConsent: boolean,
): CatalogueShownBody {
  const originalBody = sourceText(source);
  const originalCoverage = computeCoverage(originalBody, lexicon, heldLemmas);
  const targetLevel = inferTargetLevelFromHeldCount(heldLemmas.size);
  const sourceUrl = source.sourceUrl;

  if (meetsAdaptationCoverage(originalCoverage.coveragePercent)) {
    const gate = deliveryGateForCoverage(originalCoverage.coveragePercent);
    return {
      body: originalBody,
      adapted: false,
      targetLevel,
      sourceUrl,
      coverage: originalCoverage,
      deliveryGate: gate,
      startEnabled: startEnabledForGate(gate),
      t1GapCount: 0,
    };
  }

  if (!processingConsent) {
    const gate = deliveryGateForCoverage(originalCoverage.coveragePercent);
    const gapView = computeGapSet(originalBody, lexicon, heldLemmas);
    const t1GapCount =
      gapView.kind === "list"
        ? gapView.gapCount
        : gapView.kind === "too-large"
          ? gapView.gapCount
          : 0;

    return {
      body: originalBody,
      adapted: false,
      targetLevel,
      sourceUrl,
      coverage: originalCoverage,
      deliveryGate: gate,
      startEnabled: startEnabledForGate(gate),
      t1GapCount,
    };
  }

  const cachedBody = readCachedLearnerAdaptationBody(cache, {
    originalBody,
    languageCode: source.languageCode,
    targetLevel,
    heldLemmas,
  });
  const shownBody = cachedBody ?? originalBody;
  const adapted = Boolean(cachedBody);
  const coverage = computeCoverage(shownBody, lexicon, heldLemmas);
  const deliveryGate = deliveryGateForCoverage(coverage.coveragePercent);
  const gapView = computeGapSet(shownBody, lexicon, heldLemmas);
  const t1GapCount =
    gapView.kind === "list"
      ? gapView.gapCount
      : gapView.kind === "too-large"
        ? gapView.gapCount
        : 0;

  return {
    body: shownBody,
    adapted,
    targetLevel,
    sourceUrl,
    adaptationLabel: adapted ? adaptationLabelForLevel(targetLevel) : undefined,
    coverage,
    deliveryGate,
    startEnabled: startEnabledForGate(deliveryGate),
    t1GapCount,
  };
}

export function resolveSourceShownBody(
  source: Source,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  catalogueCache: AdaptationCacheStore,
  personalCache: AdaptationCacheStore,
  processingConsent: boolean,
): CatalogueShownBody {
  if (source.origin === "learner") {
    return resolveLearnerShownBody(
      source,
      lexicon,
      heldLemmas,
      personalCache,
      processingConsent,
    );
  }

  return resolveCatalogueShownBody(source, lexicon, heldLemmas, catalogueCache);
}
