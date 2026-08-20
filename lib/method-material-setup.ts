/**
 * Method detail material setup — topic chips, catalogue preview, practice href.
 * Contract: docs/specs/feature/method-material-setup.md
 */
import type { DeliveryGate } from "@/lib/adaptation-delivery";
import {
  computeCoverage,
  sourceText,
  sourcesForTopic,
  type ComfortBand,
  type CoverageResult,
  type Source,
} from "@/lib/coverage";
import { learnerPrivateLicence } from "@/lib/content-ingestion";
import { DEFAULT_EXTENSIVE_READING_SOURCE_ID, DEFAULT_PARTIAL_DICTATION_SOURCE_ID } from "@/lib/content-source-constants";
import type { MaterialTopic, MethodEntry } from "@/lib/method-catalogue";
import type { MaterialUnitId } from "@/lib/material-unit";
import type { Lexicon } from "@/lib/lexicon";
import type { RecipeVariantId } from "@/lib/exercise-recipe/types";
import { variantIdForMaterialSetup } from "@/lib/exercise-recipe/variant";

export const APP_PICK_TOPIC_ID = "app-pick";
export const OWN_TOPIC_ID = "own";

export type MaterialTopicSelection = typeof APP_PICK_TOPIC_ID | typeof OWN_TOPIC_ID | string;

export type MaterialSetupLabels = {
  appPick: string;
  own: string;
  topicLabel: (labelKey: string) => string;
  unitLabel: (unitId: MaterialUnitId, durationSec?: number) => string;
  comfortBand: (band: ComfortBand) => string;
  coverageLine: (coveragePercent: number, bandLabel: string) => string;
  demandingLine: (coveragePercent: number, wordsToComfortable: number) => string;
  t1SupportLine: (coveragePercent: number, gapCount: number) => string;
  blockedLine: (coveragePercent: number, targetLevel: string) => string;
  adaptationLabel: (targetLevel: string) => string;
  appPickPreview: (coveragePercent: number, bandLabel: string) => string;
  emptyTopic: string;
  keepInLibrary: string;
  uploadFile: string;
  pasteText: string;
  pastePlaceholder: string;
  linkUrl: string;
};

export type MaterialTopicChipState = {
  id: MaterialTopicSelection;
  label: string;
  disabled: boolean;
  emptyReason?: string;
};

export type MaterialUnitOption = {
  id: MaterialUnitId;
  label: string;
  durationSec?: number;
};

export type MaterialSetupPreview = {
  sourceId: string;
  title: string;
  coverage: CoverageResult;
  unitId: MaterialUnitId;
  unitLabel: string;
  timeLabel: string;
  demandingCopy?: string;
  adapted?: boolean;
  targetLevel?: string;
  sourceUrl?: string;
  adaptationLabel?: string;
  deliveryGate?: DeliveryGate;
  startEnabled?: boolean;
  t1GapCount?: number;
};

export type MaterialSetupContext = {
  topicChips: MaterialTopicChipState[];
  unitOptions: MaterialUnitOption[];
  defaultTopicId: MaterialTopicSelection;
  defaultUnitId: MaterialUnitId;
  previews: Partial<Record<MaterialTopicSelection, Partial<Record<MaterialUnitId, MaterialSetupPreview>>>>;
};

export function hasMaterialSetup(method: MethodEntry): boolean {
  return (method.materialTopics?.length ?? 0) > 0;
}

export function defaultMaterialUnitId(method: MethodEntry): MaterialUnitId {
  const declared = method.materialUnits ?? [{ id: "sentence" as const, default: true }];
  return (declared.find((unit) => unit.default)?.id ??
    declared[0]?.id ??
    "sentence") as MaterialUnitId;
}

export function materialUnitOptions(
  method: MethodEntry,
  labels: MaterialSetupLabels,
): MaterialUnitOption[] {
  const declared = method.materialUnits ?? [{ id: "sentence" }];
  return declared.map((unit) => ({
    id: unit.id as MaterialUnitId,
    durationSec: unit.durationSec,
    label: labels.unitLabel(unit.id as MaterialUnitId, unit.durationSec),
  }));
}

export function topicChipsForMethod(
  method: MethodEntry,
  sources: readonly Source[],
  labels: MaterialSetupLabels,
): MaterialTopicChipState[] {
  const chips: MaterialTopicChipState[] = [
    { id: APP_PICK_TOPIC_ID, label: labels.appPick, disabled: sources.length === 0 },
  ];

  for (const topic of method.materialTopics ?? []) {
    const matchCount = sources.filter((source) => source.tags?.includes(topic.id)).length;
    chips.push({
      id: topic.id,
      label: labels.topicLabel(topic.labelKey),
      disabled: matchCount === 0,
      emptyReason: matchCount === 0 ? labels.emptyTopic : undefined,
    });
  }

  chips.push({ id: OWN_TOPIC_ID, label: labels.own, disabled: false });
  return chips;
}

export function pickAppPickSource(
  sources: readonly Source[],
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): Source | null {
  if (sources.length === 0) return null;

  const ranked = [...sources]
    .map((source) => ({
      source,
      coverage: computeCoverage(sourceText(source), lexicon, heldLemmas),
    }))
    .sort((a, b) => {
      const comfortableDelta =
        Number(b.coverage.comfortBand === "comfortable") -
        Number(a.coverage.comfortBand === "comfortable");
      if (comfortableDelta !== 0) return comfortableDelta;
      return b.coverage.coveragePercent - a.coverage.coveragePercent;
    });

  return ranked[0]?.source ?? null;
}

export function pickTopicSource(
  sources: readonly Source[],
  topicId: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): Source | null {
  const ranked = sourcesForTopic(sources, topicId, lexicon, heldLemmas);
  return ranked[0]?.source ?? null;
}

export function titleFromLearnerText(text: string): string {
  const line = text.trim().split(/\n/)[0]?.trim() ?? "";
  if (!line) return "Your text";
  if (line.length <= 60) return line;
  return `${line.slice(0, 57)}…`;
}

export function createLearnerSourceFromText(
  text: string,
  languageCode: string,
  title = titleFromLearnerText(text),
): Source {
  return {
    id: `learner-${Date.now()}`,
    languageCode,
    kind: "text",
    title,
    origin: "learner",
    body: text.trim(),
    addedAt: new Date().toISOString(),
    ephemeral: true,
    licence: learnerPrivateLicence(),
  };
}

export function wordsToComfortable(coverage: CoverageResult): number {
  if (coverage.coveragePercent >= 95) return 0;
  const targetKnown = Math.ceil(coverage.tokenCount * 0.95);
  return Math.max(0, targetKnown - coverage.knownCount);
}

export {
  buildMaterialPreview,
  buildMaterialSetupContext,
  previewForOwnText,
} from "@/lib/material-setup-context";

export type PracticeSetupParams = {
  methodId: string;
  sourceId: string;
  topicId: MaterialTopicSelection;
  unitId: MaterialUnitId;
  durationSec?: number;
  variantMinutes?: number;
  variantId?: RecipeVariantId;
  adapted?: boolean;
  targetLevel?: string;
};

export function practiceHrefForSetup(params: PracticeSetupParams): string {
  const variantId =
    params.variantId ?? variantIdForMaterialSetup(params.methodId, params.unitId);
  const search = new URLSearchParams({
    method: params.methodId,
    sourceId: params.sourceId,
    topicId: params.topicId,
    unitId: params.unitId,
  });
  if (params.durationSec !== undefined) {
    search.set("durationSec", String(params.durationSec));
  }
  if (variantId) {
    search.set("variantId", variantId);
  }
  if (params.variantMinutes !== undefined) search.set("minutes", String(params.variantMinutes));
  if (params.adapted) search.set("adapted", "1");
  if (params.targetLevel) search.set("targetLevel", params.targetLevel);
  return `/practice?${search.toString()}`;
}

export function fallbackSourceIdForMethod(methodId: string): string | null {
  if (methodId === "partial-dictation" || methodId === "full-dictation") {
    return DEFAULT_PARTIAL_DICTATION_SOURCE_ID;
  }
  if (methodId === "extensive-reading" || methodId === "reading-aloud") {
    return DEFAULT_EXTENSIVE_READING_SOURCE_ID;
  }
  return null;
}

export function catalogueTopics(method: MethodEntry): MaterialTopic[] {
  return method.materialTopics ?? [];
}

export function isCatalogueTopicSelection(
  selection: MaterialTopicSelection,
): selection is string {
  return selection !== APP_PICK_TOPIC_ID && selection !== OWN_TOPIC_ID;
}