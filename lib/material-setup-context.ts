/**
 * Material setup preview + context assembly.
 * Contract: docs/specs/feature/method-material-setup.md
 */
import type { AdaptationCacheStore } from "@/lib/adaptation-cache";
import { buildCatalogueMaterialPreview } from "@/lib/adaptation-preview";
import { computeCoverage, type Source } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import type { LearnerWorldId } from "@/lib/learner-world";
import { sourcesMatchingActiveWorld } from "@/lib/learner-world";
import type { MethodEntry } from "@/lib/method-catalogue";
import {
  APP_PICK_TOPIC_ID,
  createLearnerSourceFromText,
  defaultMaterialUnitId,
  hasMaterialSetup,
  materialUnitOptions,
  pickAppPickSource,
  topicChipsForMethod,
  wordsToComfortable,
  type MaterialSetupContext,
  type MaterialSetupLabels,
  type MaterialSetupPreview,
} from "@/lib/method-material-setup";
import { pickTopicSourceWithLaneFallback } from "@/lib/generated-news";
import {
  DEFAULT_WINDOW_DURATION_SEC,
  resolveMaterialUnit,
  type MaterialUnitId,
} from "@/lib/material-unit";
import { formatReadingTimeLabel } from "@/lib/reading-time";

export function buildMaterialPreview(
  source: Source,
  method: MethodEntry,
  unitId: MaterialUnitId,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  labels: MaterialSetupLabels,
  options?: { cache?: AdaptationCacheStore },
): MaterialSetupPreview {
  if (source.origin === "catalogue" && options?.cache) {
    return buildCatalogueMaterialPreview(
      source,
      method,
      unitId,
      lexicon,
      heldLemmas,
      labels,
      options.cache,
    );
  }

  const unitDeclaration = method.materialUnits?.find((unit) => unit.id === unitId);
  const resolved = resolveMaterialUnit(source, unitId, {
    durationSec: unitDeclaration?.durationSec ?? DEFAULT_WINDOW_DURATION_SEC,
    lexicon,
    heldLemmas,
  });
  const coverage = computeCoverage(resolved.text, lexicon, heldLemmas);
  const wordsGap = wordsToComfortable(coverage);
  const timeLabel = formatReadingTimeLabel(coverage.tokenCount);

  return {
    sourceId: source.id,
    title: source.title,
    coverage,
    unitId,
    unitLabel: labels.unitLabel(unitId, unitDeclaration?.durationSec),
    timeLabel,
    startEnabled: true,
    demandingCopy:
      coverage.comfortBand === "demanding" && wordsGap > 0
        ? labels.demandingLine(coverage.coveragePercent, wordsGap)
        : undefined,
  };
}

export function buildMaterialSetupContext(
  method: MethodEntry,
  sources: readonly Source[],
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  labels: MaterialSetupLabels,
  options?: { cache?: AdaptationCacheStore; activeWorld?: LearnerWorldId },
): MaterialSetupContext | null {
  if (!hasMaterialSetup(method)) return null;

  const topicChips = topicChipsForMethod(method, sources, labels);
  const unitOptions = materialUnitOptions(method, labels);
  const defaultUnitId = defaultMaterialUnitId(method);
  const previews: MaterialSetupContext["previews"] = {};
  const previewOptions = options?.cache ? { cache: options.cache } : undefined;
  const activeWorld = options?.activeWorld ?? "general";
  const worldSources = sourcesMatchingActiveWorld(sources, activeWorld);

  const appPickSource = pickAppPickSource(sources, lexicon, heldLemmas, activeWorld);
  if (appPickSource) {
    previews[APP_PICK_TOPIC_ID] = {};
    for (const unit of unitOptions) {
      previews[APP_PICK_TOPIC_ID]![unit.id] = buildMaterialPreview(
        appPickSource,
        method,
        unit.id,
        lexicon,
        heldLemmas,
        labels,
        previewOptions,
      );
    }
  }

  for (const topic of method.materialTopics ?? []) {
    const source = pickTopicSourceWithLaneFallback(worldSources, topic.id, lexicon, heldLemmas);
    if (!source) continue;
    previews[topic.id] = {};
    for (const unit of unitOptions) {
      previews[topic.id]![unit.id] = buildMaterialPreview(
        source,
        method,
        unit.id,
        lexicon,
        heldLemmas,
        labels,
        previewOptions,
      );
    }
  }

  return {
    topicChips,
    unitOptions,
    defaultTopicId: APP_PICK_TOPIC_ID,
    defaultUnitId,
    previews,
  };
}

export function previewForOwnText(
  text: string,
  method: MethodEntry,
  unitId: MaterialUnitId,
  languageCode: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  labels: MaterialSetupLabels,
): MaterialSetupPreview | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const source = createLearnerSourceFromText(trimmed, languageCode);
  return buildMaterialPreview(source, method, unitId, lexicon, heldLemmas, labels);
}
