"use server";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import {
  ADAPTATION_CONSENT_COOKIE,
  parseAdaptationConsent,
  serializeAdaptationConsent,
} from "@/lib/adaptation-consent";
import { createAdaptationRewrite } from "@/lib/adaptation-rewrite";
import { loadPersonalAdaptationCache } from "@/lib/adaptation-cache";
import { buildLearnerMaterialPreview } from "@/lib/learner-adaptation-preview";
import { readCachedLearnerAdaptationBody } from "@/lib/learner-adaptation";
import { createLearnerTextSource } from "@/lib/db/content-sources";
import { getAccount } from "@/lib/db/auth";
import {
  EPHEMERAL_SOURCE_COOKIE,
  serializeEphemeralSourceCookie,
} from "@/lib/ephemeral-source-cookie";
import {
  createLearnerSourceFromText,
  OWN_TOPIC_ID,
  practiceHrefForSetup,
  titleFromLearnerText,
  type MaterialSetupLabels,
  type MaterialSetupPreview,
  type MaterialTopicSelection,
} from "@/lib/method-material-setup";
import { inferTargetLevelFromHeldCount } from "@/lib/target-level";
import { rejectOversizeLearnerText } from "@/lib/learner-text-limits";
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
    t1SupportLine: (coveragePercent: number, gapCount: number) =>
      t("t1SupportLine", {
        percent: Math.round(coveragePercent),
        gaps: gapCount,
      }),
    blockedLine: (coveragePercent: number, targetLevel: string) =>
      t("blockedLine", {
        percent: Math.round(coveragePercent),
        level: targetLevel,
      }),
    adaptationLabel: (targetLevel: string) => t("adaptationLabel", { level: targetLevel }),
    generatedLabel: () => t("generatedLabel"),
    adaptationFailed: (targetLevel: string) => t("adaptationFailed", { level: targetLevel }),
    processingConsent: t("processingConsent"),
    processingConsentHint: t("processingConsentHint"),
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

export async function grantAdaptationConsentAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADAPTATION_CONSENT_COOKIE, serializeAdaptationConsent(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function previewOwnMaterialAction(
  methodId: string,
  text: string,
  unitId: MaterialUnitId,
  processingConsent?: boolean,
): Promise<MaterialSetupPreview | null> {
  // The preview tokenises the whole text and scores it against the lexicon on
  // every keystroke-triggered call. Bounding it here keeps the cost of one
  // request bounded; without it the only ceiling was the request body size.
  if (rejectOversizeLearnerText(text)) return null;

  const t = await getTranslations("methodMaterial");
  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, methodId);
  if (!method) return null;

  const bundle = await readMaterialSetupBundle(method, labelsFromTranslator(t));
  if (bundle.status !== "ok") return null;

  const cookieStore = await cookies();
  const consentGranted =
    processingConsent ?? parseAdaptationConsent(cookieStore.get(ADAPTATION_CONSENT_COOKIE)?.value);

  return buildLearnerMaterialPreview(
    text,
    method,
    unitId,
    bundle.languageCode,
    bundle.lexicon,
    bundle.heldLemmas,
    labelsFromTranslator(t),
    {
      processingConsent: consentGranted,
      rewrite: createAdaptationRewrite(),
      cache: loadPersonalAdaptationCache(),
    },
  );
}

export type StartMaterialPracticeInput = {
  methodId: string;
  topicId: MaterialTopicSelection;
  unitId: MaterialUnitId;
  durationSec?: number;
  variantMinutes?: number;
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
  const t = await getTranslations("methodMaterial");
  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, input.methodId);
  if (!method) return { status: "error", error: "Method not found." };

  if (input.topicId !== OWN_TOPIC_ID) {
    if (!input.catalogueSourceId) {
      return { status: "error", error: "Choose material before starting." };
    }

    const bundle = await readMaterialSetupBundle(method, labelsFromTranslator(t));
    if (bundle.status !== "ok") {
      return { status: "error", error: "Could not load your language settings." };
    }

    const preview = bundle.context.previews[input.topicId]?.[input.unitId];
    if (preview?.startEnabled === false) {
      return {
        status: "error",
        error: "This text is too hard for your vocabulary right now.",
      };
    }

    return {
      status: "ok",
      href: practiceHrefForSetup({
        methodId: input.methodId,
        sourceId: input.catalogueSourceId,
        topicId: input.topicId,
        unitId: input.unitId,
        durationSec: input.durationSec,
        variantMinutes: input.variantMinutes,
        adapted: preview?.adapted,
        targetLevel: preview?.targetLevel,
      }),
    };
  }

  const trimmed = input.ownText?.trim() ?? "";
  if (!trimmed) {
    return { status: "error", error: "Paste some text before starting." };
  }

  // Both branches below read this text: the library branch writes it to
  // `content_sources`, the session-only branch parses it into a Source. The
  // cookie serializer has its own, smaller cap (3500) for its own reason.
  const oversize = rejectOversizeLearnerText(trimmed);
  if (oversize) return oversize;

  const bundle = await readMaterialSetupBundle(method, labelsFromTranslator(t));
  if (bundle.status !== "ok") {
    return { status: "error", error: "Could not load your language settings." };
  }

  const labels = labelsFromTranslator(t);
  const cookieStore = await cookies();
  const consentGranted = parseAdaptationConsent(
    cookieStore.get(ADAPTATION_CONSENT_COOKIE)?.value,
  );
  const preview = await buildLearnerMaterialPreview(
    trimmed,
    method,
    input.unitId,
    bundle.languageCode,
    bundle.lexicon,
    bundle.heldLemmas,
    labels,
    {
      processingConsent: consentGranted,
      rewrite: createAdaptationRewrite(),
      cache: loadPersonalAdaptationCache(),
    },
  );

  if (!preview || preview.startEnabled === false) {
    return {
      status: "error",
      error:
        preview?.adaptationError ??
        "This text is too hard for your vocabulary right now.",
    };
  }

  const targetLevel =
    preview.targetLevel ?? inferTargetLevelFromHeldCount(bundle.heldLemmas.size);
  const adapted = preview.adapted ?? false;
  let practiceBody = trimmed;
  if (adapted) {
    const cachedBody = readCachedLearnerAdaptationBody(loadPersonalAdaptationCache(), {
      originalBody: trimmed,
      languageCode: bundle.languageCode,
      targetLevel,
      heldLemmas: bundle.heldLemmas,
    });
    if (cachedBody) practiceBody = cachedBody;
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
        variantMinutes: input.variantMinutes,
        adapted,
        targetLevel,
      }),
    };
  }

  const source = createLearnerSourceFromText(practiceBody, bundle.languageCode);
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
      variantMinutes: input.variantMinutes,
      adapted,
      targetLevel,
    }),
  };
}
