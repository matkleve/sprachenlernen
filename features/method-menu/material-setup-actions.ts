"use server";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { createLearnerTextSource } from "@/lib/db/content-sources";
import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import {
  EPHEMERAL_SOURCE_COOKIE,
  serializeEphemeralSourceCookie,
} from "@/lib/ephemeral-source-cookie";
import {
  createLearnerSourceFromText,
  OWN_TOPIC_ID,
  practiceHrefForSetup,
  previewForOwnText,
  titleFromLearnerText,
  type MaterialSetupLabels,
  type MaterialSetupPreview,
  type MaterialTopicSelection,
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

export type StartMaterialPracticeInput = {
  methodId: string;
  topicId: MaterialTopicSelection;
  unitId: MaterialUnitId;
  durationSec?: number;
  budgetMinutes?: number;
  ownText?: string;
  keepInLibrary?: boolean;
  catalogueSourceId?: string;
};

export type StartMaterialPracticeOutcome =
  | { status: "ok"; href: string }
  | { status: "error"; error: string };

export async function startMaterialPracticeAction(
  input: StartMaterialPracticeInput,
): Promise<StartMaterialPracticeOutcome> {
  const hrefForCatalogue = () =>
    practiceHrefForSetup({
      methodId: input.methodId,
      sourceId: input.catalogueSourceId ?? "",
      topicId: input.topicId,
      unitId: input.unitId,
      durationSec: input.durationSec,
      budgetMinutes: input.budgetMinutes,
    });

  if (input.topicId !== OWN_TOPIC_ID) {
    if (!input.catalogueSourceId) {
      return { status: "error", error: "Choose material before starting." };
    }
    return { status: "ok", href: hrefForCatalogue() };
  }

  const trimmed = input.ownText?.trim() ?? "";
  if (!trimmed) {
    return { status: "error", error: "Paste some text before starting." };
  }

  const t = await getTranslations("methodMaterial");
  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, input.methodId);
  if (!method) return { status: "error", error: "Method not found." };

  const bundle = await readMaterialSetupBundle(method, labelsFromTranslator(t));
  if (bundle.status !== "ok") {
    return { status: "error", error: "Could not load your language settings." };
  }

  if (input.keepInLibrary) {
    const account = await getAccount();
    if (!account) {
      return { status: "error", error: "Sign in to keep text in your library." };
    }

    const saved = await createLearnerTextSource({
      languageCode: bundle.languageCode,
      body: trimmed,
      title: titleFromLearnerText(trimmed),
    });
    if (saved.status === "error") return saved;

    return {
      status: "ok",
      href: practiceHrefForSetup({
        methodId: input.methodId,
        sourceId: saved.source.id,
        topicId: input.topicId,
        unitId: input.unitId,
        durationSec: input.durationSec,
        budgetMinutes: input.budgetMinutes,
      }),
    };
  }

  const source = createLearnerSourceFromText(trimmed, bundle.languageCode);
  try {
    const cookieStore = await cookies();
    cookieStore.set(EPHEMERAL_SOURCE_COOKIE, serializeEphemeralSourceCookie(source), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
      path: "/",
    });
  } catch (cause) {
    const message =
      cause instanceof Error
        ? cause.message
        : "Could not start a session-only practice run.";
    return { status: "error", error: message };
  }

  return {
    status: "ok",
    href: practiceHrefForSetup({
      methodId: input.methodId,
      sourceId: source.id,
      topicId: input.topicId,
      unitId: input.unitId,
      durationSec: input.durationSec,
      budgetMinutes: input.budgetMinutes,
    }),
  };
}
