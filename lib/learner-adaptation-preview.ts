/**
 * Learner upload preview with optional T3 personal rewrite.
 * Contract: docs/specs/service/content-adaptation.md (T-CI5)
 */
import type { AdaptationCacheStore } from "@/lib/adaptation-cache";
import type { AdaptationRewriteFn } from "@/lib/catalogue-adaptation";
import { computeGapSet } from "@/lib/content-gap";
import { meetsAdaptationCoverage } from "@/lib/content-adaptation";
import {
  deliveryGateForCoverage,
  startEnabledForGate,
} from "@/lib/adaptation-delivery";
import { computeCoverage } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import { adaptLearnerText } from "@/lib/learner-adaptation";
import type { MaterialSetupPreview } from "@/lib/method-material-setup";
import {
  createLearnerSourceFromText,
  wordsToComfortable,
} from "@/lib/method-material-setup";
import {
  DEFAULT_WINDOW_DURATION_SEC,
  resolveMaterialUnit,
  type MaterialUnitId,
} from "@/lib/material-unit";
import type { MethodEntry } from "@/lib/method-catalogue";
import { formatReadingTimeLabel } from "@/lib/reading-time";
import { inferTargetLevelFromHeldCount } from "@/lib/target-level";
import type { MaterialPreviewLabels } from "@/lib/adaptation-preview";
import { sourceWithShownBody } from "@/lib/adaptation-preview";

export type LearnerPreviewOptions = {
  processingConsent: boolean;
  rewrite: AdaptationRewriteFn;
  cache: AdaptationCacheStore;
};

export async function buildLearnerMaterialPreview(
  text: string,
  method: MethodEntry,
  unitId: MaterialUnitId,
  languageCode: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  labels: MaterialPreviewLabels,
  options: LearnerPreviewOptions,
): Promise<MaterialSetupPreview | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const source = createLearnerSourceFromText(trimmed, languageCode);
  const targetLevel = inferTargetLevelFromHeldCount(heldLemmas.size);
  const originalCoverage = computeCoverage(trimmed, lexicon, heldLemmas);
  const needsAdaptation = !meetsAdaptationCoverage(originalCoverage.coveragePercent);

  const adaptation = await adaptLearnerText({
    originalBody: trimmed,
    languageCode,
    targetLevel,
    lexicon,
    heldLemmas,
    rewrite: options.rewrite,
    cache: options.cache,
    processingConsent: options.processingConsent,
  });

  if (adaptation.status === "failed") {
    const unitDeclaration = method.materialUnits?.find((unit) => unit.id === unitId);
    return {
      sourceId: source.id,
      title: source.title,
      coverage: originalCoverage,
      unitId,
      unitLabel: labels.unitLabel(unitId, unitDeclaration?.durationSec),
      timeLabel: formatReadingTimeLabel(originalCoverage.tokenCount),
      targetLevel,
      needsAdaptation,
      processingConsentRequired: needsAdaptation && !options.processingConsent,
      adaptationError: labels.adaptationFailed(targetLevel),
      startEnabled: false,
      deliveryGate: "blocked",
    };
  }

  const shownBody = adaptation.body;
  const adapted = adaptation.adapted;
  const unitDeclaration = method.materialUnits?.find((unit) => unit.id === unitId);
  const resolved = resolveMaterialUnit(sourceWithShownBody(source, shownBody), unitId, {
    durationSec: unitDeclaration?.durationSec ?? DEFAULT_WINDOW_DURATION_SEC,
    lexicon,
    heldLemmas,
  });
  const coverage = computeCoverage(resolved.text, lexicon, heldLemmas);
  const wordsGap = wordsToComfortable(coverage);
  const timeLabel = formatReadingTimeLabel(coverage.tokenCount);
  const gate = deliveryGateForCoverage(coverage.coveragePercent);
  const gapView = computeGapSet(shownBody, lexicon, heldLemmas);
  const t1GapCount =
    gapView.kind === "list"
      ? gapView.gapCount
      : gapView.kind === "too-large"
        ? gapView.gapCount
        : 0;

  return {
    sourceId: source.id,
    title: source.title,
    coverage,
    unitId,
    unitLabel: labels.unitLabel(unitId, unitDeclaration?.durationSec),
    timeLabel,
    adapted,
    targetLevel,
    adaptationLabel: adapted ? labels.adaptationLabel(targetLevel) : undefined,
    deliveryGate: gate,
    startEnabled: startEnabledForGate(gate),
    t1GapCount,
    needsAdaptation,
    processingConsentRequired: needsAdaptation && !options.processingConsent,
    demandingCopy:
      gate === "t1-support"
        ? labels.t1SupportLine(coverage.coveragePercent, t1GapCount)
        : gate === "blocked"
          ? labels.blockedLine(coverage.coveragePercent, targetLevel)
          : coverage.comfortBand === "demanding" && wordsGap > 0
            ? labels.demandingLine(coverage.coveragePercent, wordsGap)
            : undefined,
  };
}
