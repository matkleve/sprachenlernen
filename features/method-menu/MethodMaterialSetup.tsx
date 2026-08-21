"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import type { MethodEntry } from "@/lib/method-catalogue";
import {
  OWN_TOPIC_ID,
  type MaterialSetupContext,
  type MaterialSetupPreview,
  type MaterialTopicSelection,
  practiceHrefForSetup,
} from "@/lib/method-material-setup";
import type { SessionContract } from "@/lib/method-session-contract";
import { usesExerciseRunner } from "@/lib/method-session";
import type { MaterialUnitId } from "@/lib/material-unit";
import { cn } from "@/lib/utils";

import { MaterialSetupPreviewCard } from "./MaterialSetupPreviewCard";
import { OwnMaterialIntake } from "./OwnMaterialIntake";
import {
  grantAdaptationConsentAction,
  previewOwnMaterialAction,
  startMaterialPracticeAction,
} from "./material-setup-actions";
import { MethodSessionContractText } from "./MethodSessionContractText";

export type MethodMaterialSetupProps = {
  method: MethodEntry;
  context: MaterialSetupContext;
  canPersist?: boolean;
  variantMinutes?: number;
  sessionContract?: SessionContract | null;
  className?: string;
  /** Test hook — bypasses the server action for own-text preview. */
  previewOwnForTest?: (
    text: string,
    unitId: MaterialUnitId,
  ) => MaterialSetupPreview | null;
};

export function MethodMaterialSetup({
  method,
  context,
  canPersist = false,
  variantMinutes,
  sessionContract = null,
  className,
  previewOwnForTest,
}: MethodMaterialSetupProps) {
  const router = useRouter();
  const t = useTranslations("methodMaterial");
  const tMenu = useTranslations("methodMenu");
  const [topicId, setTopicId] = useState<MaterialTopicSelection>(context.defaultTopicId);
  const [unitId, setUnitId] = useState<MaterialUnitId>(context.defaultUnitId);
  const [ownText, setOwnText] = useState("");
  const [ownPreview, setOwnPreview] = useState<MaterialSetupPreview | null>(null);
  const [processingConsent, setProcessingConsent] = useState(false);
  const [keepInLibrary, setKeepInLibrary] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const labels = useMemo(
    () => ({
      comfortBand: (band: "demanding" | "comfortable" | "speed") => t(`comfort.${band}`),
      coverageLine: (coveragePercent: number, bandLabel: string) =>
        t("coverageLine", { percent: Math.round(coveragePercent), band: bandLabel }),
    }),
    [t],
  );

  useEffect(() => {
    if (topicId !== OWN_TOPIC_ID) {
      setOwnPreview(null);
      return;
    }

    const trimmed = ownText.trim();
    if (!trimmed) {
      setOwnPreview(null);
      return;
    }

    const delayMs = processingConsent ? 600 : 0;
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const preview = previewOwnForTest
          ? previewOwnForTest(trimmed, unitId)
          : await previewOwnMaterialAction(method.id, trimmed, unitId, processingConsent);
        setOwnPreview(preview);
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [method.id, ownText, previewOwnForTest, processingConsent, topicId, unitId]);

  const cataloguePreview =
    topicId === OWN_TOPIC_ID ? ownPreview ?? undefined : context.previews[topicId]?.[unitId];

  const omitVariantOnStart = unitId === "full";
  const catalogueStartAllowed =
    Boolean(cataloguePreview?.sourceId) &&
    Boolean(cataloguePreview?.timeLabel) &&
    cataloguePreview?.deliveryGate !== "blocked" &&
    cataloguePreview?.startEnabled !== false;
  const startEnabled = catalogueStartAllowed && !isPending;
  const showOwnIntake = topicId === OWN_TOPIC_ID;
  const showCataloguePreview = topicId !== OWN_TOPIC_ID && Boolean(cataloguePreview);

  const selectedUnit = context.unitOptions.find((unit) => unit.id === unitId);
  const catalogueStartHref =
    cataloguePreview && topicId !== OWN_TOPIC_ID && usesExerciseRunner(method) && startEnabled
      ? practiceHrefForSetup({
          methodId: method.id,
          sourceId: cataloguePreview.sourceId,
          topicId,
          unitId,
          durationSec: selectedUnit?.durationSec,
          variantMinutes: omitVariantOnStart ? undefined : variantMinutes,
          adapted: cataloguePreview.adapted,
          targetLevel: cataloguePreview.targetLevel,
        })
      : null;

  const sessionContractForPreview =
    sessionContract && cataloguePreview?.adapted
      ? { ...sessionContract, adapted: true }
      : sessionContract;

  const handleProcessingConsentChange = (checked: boolean) => {
    setProcessingConsent(checked);
    if (checked) {
      startTransition(async () => {
        await grantAdaptationConsentAction();
      });
    }
  };

  const handleStart = () => {
    if (!cataloguePreview || !usesExerciseRunner(method)) return;
    setStartError(null);

    startTransition(async () => {
      const result = await startMaterialPracticeAction({
        methodId: method.id,
        topicId,
        unitId,
        durationSec: selectedUnit?.durationSec,
        variantMinutes: omitVariantOnStart ? undefined : variantMinutes,
        ownText: topicId === OWN_TOPIC_ID ? ownText : undefined,
        keepInLibrary: topicId === OWN_TOPIC_ID ? keepInLibrary : false,
        catalogueSourceId: topicId === OWN_TOPIC_ID ? undefined : cataloguePreview.sourceId,
      });

      if (result.status === "error") {
        setStartError(result.error);
        return;
      }

      router.push(result.href);
    });
  };

  return (
    <section
      className={cn(
        "rounded-card border border-line bg-surface-raised p-4 shadow-soft md:p-5",
        "space-y-3 md:space-y-4",
        className,
      )}
      aria-labelledby="material-setup-heading"
    >
      <div>
        <h2 id="material-setup-heading" className="text-sm font-semibold text-ink">
          {t("topicHeading")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("topicHeading")}>
          {context.topicChips.map((chip) => (
            <FilterPill
              key={chip.id}
              current={topicId === chip.id}
              disabled={chip.disabled}
              title={chip.emptyReason}
              onClick={() => setTopicId(chip.id)}
            >
              {chip.label}
            </FilterPill>
          ))}
        </div>
        {context.topicChips.some((chip) => chip.emptyReason && chip.id === topicId) ? (
          <p className="mt-2 text-sm text-muted">{t("emptyTopic")}</p>
        ) : null}
      </div>

      {context.unitOptions.length > 1 ? (
        <div>
          <h3 className="text-sm font-semibold text-ink">{t("unitHeading")}</h3>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("unitHeading")}>
            {context.unitOptions.map((unit) => (
              <FilterPill
                key={unit.id}
                current={unitId === unit.id}
                onClick={() => setUnitId(unit.id)}
              >
                {unit.label}
              </FilterPill>
            ))}
          </div>
        </div>
      ) : null}

      {showOwnIntake ? (
        <OwnMaterialIntake
          ownText={ownText}
          onOwnTextChange={setOwnText}
          keepInLibrary={keepInLibrary}
          onKeepInLibraryChange={setKeepInLibrary}
          canPersist={canPersist}
          processingConsent={processingConsent}
          onProcessingConsentChange={handleProcessingConsentChange}
          ownPreview={ownPreview}
          ownMaterialCoverage={(percent, feel) =>
            t("ownMaterialCoverage", {
              percent: Math.round(percent),
              feel: t(`ownMaterialFeel.${feel}`),
            })
          }
          adaptingLabel={t("adapting")}
          showAdapting={isPending && processingConsent}
          labels={{
            uploadFile: t("uploadFile"),
            pasteText: t("pasteText"),
            pastePlaceholder: t("pastePlaceholder"),
            linkUrl: t("linkUrl"),
            keepInLibrary: t("keepInLibrary"),
            keepRequiresSignIn: t("keepRequiresSignIn"),
            processingConsent: t("processingConsent"),
            processingConsentHint: t("processingConsentHint"),
          }}
        />
      ) : null}

      {showCataloguePreview && cataloguePreview ? (
        <MaterialSetupPreviewCard
          preview={cataloguePreview}
          labels={labels}
          sourceUrl={cataloguePreview.sourceUrl}
          viewOriginalLabel={t("viewOriginal")}
        />
      ) : null}

      {startError ? (
        <p className="text-sm text-danger" role="alert">
          {startError}
        </p>
      ) : null}

      {sessionContractForPreview ? (
        <MethodSessionContractText contract={sessionContractForPreview} />
      ) : null}

      {usesExerciseRunner(method) ? (
        topicId === OWN_TOPIC_ID ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!startEnabled}
            onClick={handleStart}
          >
            {tMenu("startSession")}
          </Button>
        ) : catalogueStartHref && catalogueStartAllowed ? (
          <ActionLink href={catalogueStartHref} variant="primary" size="lg">
            {tMenu("startSession")}
          </ActionLink>
        ) : (
          <Button type="button" variant="primary" size="lg" disabled>
            {tMenu("startSession")}
          </Button>
        )
      ) : (
        <p className="text-sm text-muted">{tMenu("sessionNotBuilt")}</p>
      )}
    </section>
  );
}
