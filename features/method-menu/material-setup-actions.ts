"use server";

import { getTranslations } from "next-intl/server";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import {
  previewForOwnText,
  type MaterialSetupLabels,
  type MaterialSetupPreview,
} from "@/lib/method-material-setup";
import type { MaterialUnitId } from "@/lib/material-unit";

import { readMaterialSetupBundle } from "./readMaterialSetup";

function labelsFromTranslator(t: Awaited<ReturnType<typeof getTranslations>>): MaterialSetupLabels {
  return {
    appPick: t("appPick"),
    own: t("own"),
    topicLabel: (labelKey: string) => t(`topics.${labelKey}` as "topics.news"),
    unitLabel: (id: MaterialUnitId, durationSec?: number) =>
      id === "window" && durationSec
        ? t("units.window", { minutes: Math.round(durationSec / 60) })
        : t(`units.${id}` as "units.sentence"),
    comfortBand: (band: "demanding" | "comfortable" | "speed") => t(`comfort.${band}`),
    coverageLine: (coveragePercent: number, bandLabel: string) =>
      t("coverageLine", { percent: Math.round(coveragePercent), band: bandLabel }),
    demandingLine: (coveragePercent: number, wordsToComfortable: number) =>
      t("demandingLine", {
        percent: Math.round(coveragePercent),
        words: wordsToComfortable,
      }),
    appPickPreview: (coveragePercent: number, bandLabel: string) =>
      t("appPickPreview", { percent: Math.round(coveragePercent), band: bandLabel }),
    emptyTopic: t("emptyTopic"),
    keepInLibrary: t("keepInLibrary"),
    uploadFile: t("uploadFile"),
    pasteText: t("pasteText"),
    pastePlaceholder: t("pastePlaceholder"),
    linkUrl: t("linkUrl"),
  };
}

export async function previewOwnMaterialAction(
  methodId: string,
  text: string,
  unitId: MaterialUnitId,
): Promise<MaterialSetupPreview | null> {
  const t = await getTranslations("methodMaterial");
  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, methodId);
  if (!method) return null;

  const bundle = await readMaterialSetupBundle(method, labelsFromTranslator(t));
  if (bundle.status !== "ok") return null;

  return previewForOwnText(
    text,
    method,
    unitId,
    bundle.languageCode,
    bundle.lexicon,
    bundle.heldLemmas,
    labelsFromTranslator(t),
  );
}
