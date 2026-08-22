/**
 * Resolve catalogue shown body (original vs band T2 cache) + personal gate.
 * Contract: docs/specs/service/content-adaptation.md (T-CI4)
 */
import type { AdaptationCacheStore } from "@/lib/adaptation-cache";
import {
  DEFAULT_T2_PROMPT_VERSION,
  readCachedAdaptationBody,
} from "@/lib/catalogue-adaptation";
import { computeGapSet } from "@/lib/content-gap";
import {
  adaptationLabelForLevel,
  meetsAdaptationCoverage,
  type AdaptationCacheKey,
} from "@/lib/content-adaptation";
import {
  deliveryGateForCoverage,
  startEnabledForGate,
  type DeliveryGate,
} from "@/lib/adaptation-delivery";
import { computeCoverage, sourceText, type CoverageResult, type Source } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import {
  DEFAULT_WINDOW_DURATION_SEC,
  resolveMaterialUnit,
  type MaterialUnitId,
} from "@/lib/material-unit";
import type { MethodEntry } from "@/lib/method-catalogue";
import { formatReadingTimeLabel } from "@/lib/reading-time";
import { inferTargetLevelFromHeldCount } from "@/lib/target-level";
import { readCachedLearnerAdaptationBody } from "@/lib/learner-adaptation";

export type CatalogueShownBody = {
  body: string;
  adapted: boolean;
  targetLevel: string;
  sourceUrl?: string;
  adaptationLabel?: string;
  coverage: CoverageResult;
  deliveryGate: DeliveryGate;
  startEnabled: boolean;
  t1GapCount: number;
};

function cacheKeyForSource(source: Source, targetLevel: string): AdaptationCacheKey {
  return {
    sourceId: source.id,
    languageCode: source.languageCode,
    targetLevel,
    tier: "T2",
    promptVersion: DEFAULT_T2_PROMPT_VERSION,
  };
}

export function resolveCatalogueShownBody(
  source: Source,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  cache: AdaptationCacheStore,
): CatalogueShownBody {
  const originalBody = sourceText(source);
  const originalCoverage = computeCoverage(originalBody, lexicon, heldLemmas);
  const targetLevel = inferTargetLevelFromHeldCount(heldLemmas.size);
  const sourceUrl = source.sourceUrl ?? source.licence?.sourceUrl;

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

  const cachedBody = readCachedAdaptationBody(cache, cacheKeyForSource(source, targetLevel));
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

export function sourceWithShownBody(source: Source, shownBody: string): Source {
  if (source.kind !== "text") return source;
  return { ...source, body: shownBody };
}

export type MaterialPreviewLabels = {
  unitLabel: (unitId: MaterialUnitId, durationSec?: number) => string;
  demandingLine: (coveragePercent: number, wordsToComfortable: number) => string;
  t1SupportLine: (coveragePercent: number, gapCount: number) => string;
  blockedLine: (coveragePercent: number, targetLevel: string) => string;
  adaptationLabel: (targetLevel: string) => string;
  adaptationFailed: (targetLevel: string) => string;
};

function wordsToComfortable(coverage: CoverageResult): number {
  if (coverage.coveragePercent >= 95) return 0;
  const targetKnown = Math.ceil(coverage.tokenCount * 0.95);
  return Math.max(0, targetKnown - coverage.knownCount);
}

export function buildCatalogueMaterialPreview(
  source: Source,
  method: MethodEntry,
  unitId: MaterialUnitId,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  labels: MaterialPreviewLabels,
  cache: AdaptationCacheStore,
): import("@/lib/method-material-setup").MaterialSetupPreview {
  const shown = resolveCatalogueShownBody(source, lexicon, heldLemmas, cache);
  const unitDeclaration = method.materialUnits?.find((unit) => unit.id === unitId);
  const resolved = resolveMaterialUnit(sourceWithShownBody(source, shown.body), unitId, {
    durationSec: unitDeclaration?.durationSec ?? DEFAULT_WINDOW_DURATION_SEC,
    lexicon,
    heldLemmas,
  });
  const coverage = computeCoverage(resolved.text, lexicon, heldLemmas);
  const wordsGap = wordsToComfortable(coverage);
  const timeLabel = formatReadingTimeLabel(coverage.tokenCount);
  const gate = shown.deliveryGate;

  return {
    sourceId: source.id,
    title: source.title,
    coverage,
    unitId,
    unitLabel: labels.unitLabel(unitId, unitDeclaration?.durationSec),
    timeLabel,
    adapted: shown.adapted,
    targetLevel: shown.targetLevel,
    sourceUrl: shown.sourceUrl,
    adaptationLabel: shown.adaptationLabel
      ? labels.adaptationLabel(shown.targetLevel)
      : undefined,
    deliveryGate: gate,
    startEnabled: shown.startEnabled,
    t1GapCount: shown.t1GapCount,
    demandingCopy:
      gate === "t1-support"
        ? labels.t1SupportLine(coverage.coveragePercent, shown.t1GapCount)
        : gate === "blocked"
          ? labels.blockedLine(coverage.coveragePercent, shown.targetLevel)
          : coverage.comfortBand === "demanding" && wordsGap > 0
            ? labels.demandingLine(coverage.coveragePercent, wordsGap)
            : undefined,
  };
}
