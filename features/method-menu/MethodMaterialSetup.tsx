"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FilterPill } from "@/components/ui/FilterPill";
import { Textarea } from "@/components/ui/Input";
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

import { previewOwnMaterialAction, startMaterialPracticeAction } from "./material-setup-actions";
import { MethodSessionContractText } from "./MethodSessionContractText";

export type MethodMaterialSetupProps = {
  method: MethodEntry;
  context: MaterialSetupContext;
  canPersist?: boolean;
  budgetMinutes?: number;
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
  budgetMinutes,
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

    startTransition(async () => {
      const preview = previewOwnForTest
        ? previewOwnForTest(trimmed, unitId)
        : await previewOwnMaterialAction(method.id, trimmed, unitId);
      setOwnPreview(preview);
    });
  }, [method.id, ownText, previewOwnForTest, topicId, unitId]);

  const cataloguePreview =
    topicId === OWN_TOPIC_ID ? ownPreview ?? undefined : context.previews[topicId]?.[unitId];

  const startEnabled = Boolean(cataloguePreview?.sourceId) && !isPending;
  const showOwnIntake = topicId === OWN_TOPIC_ID;
  const showCataloguePreview = topicId !== OWN_TOPIC_ID && Boolean(cataloguePreview);
  const showOwnPreview = topicId === OWN_TOPIC_ID && Boolean(ownPreview);

  const selectedUnit = context.unitOptions.find((unit) => unit.id === unitId);
  const catalogueStartHref =
    cataloguePreview && topicId !== OWN_TOPIC_ID && usesExerciseRunner(method)
      ? practiceHrefForSetup({
          methodId: method.id,
          sourceId: cataloguePreview.sourceId,
          topicId,
          unitId,
          durationSec: selectedUnit?.durationSec,
          budgetMinutes,
        })
      : null;

  const handleStart = () => {
    if (!cataloguePreview || !usesExerciseRunner(method)) return;
    setStartError(null);

    startTransition(async () => {
      const result = await startMaterialPracticeAction({
        methodId: method.id,
        topicId,
        unitId,
        durationSec: selectedUnit?.durationSec,
        budgetMinutes,
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
        <div className="space-y-4 rounded-card border border-line bg-surface-raised p-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" disabled>
              {t("uploadFile")}
            </Button>
            <span className="self-center text-xs text-muted">{t("pasteText")}</span>
            <Button type="button" variant="secondary" size="sm" disabled>
              {t("linkUrl")}
            </Button>
          </div>
          <Field label={t("pasteText")}>
            <Textarea
              value={ownText}
              onChange={(event) => setOwnText(event.target.value)}
              placeholder={t("pastePlaceholder")}
              rows={4}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-line text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              checked={keepInLibrary}
              disabled={!canPersist}
              title={canPersist ? undefined : t("keepRequiresSignIn")}
              onChange={(event) => setKeepInLibrary(event.target.checked)}
            />
            {t("keepInLibrary")}
          </label>
        </div>
      ) : null}

      {showCataloguePreview && cataloguePreview ? (
        <div className="rounded-card border border-line bg-surface-raised p-4 text-sm text-muted">
          <p className="font-medium text-ink">{cataloguePreview.title}</p>
          <p className="mt-1">
            {cataloguePreview.unitLabel}
            {" · "}
            {labels.coverageLine(
              cataloguePreview.coverage.coveragePercent,
              labels.comfortBand(cataloguePreview.coverage.comfortBand),
            )}
            {cataloguePreview.timeLabel ? ` · ${cataloguePreview.timeLabel}` : ""}
          </p>
          {cataloguePreview.demandingCopy ? (
            <p className="mt-2 text-muted">{cataloguePreview.demandingCopy}</p>
          ) : null}
        </div>
      ) : null}

      {showOwnPreview && cataloguePreview ? (
        <div className="rounded-card border border-line bg-surface-raised p-4 text-sm text-muted">
          <p className="font-medium text-ink">{cataloguePreview.title}</p>
          <p className="mt-1">
            {cataloguePreview.unitLabel}
            {" · "}
            {labels.coverageLine(
              cataloguePreview.coverage.coveragePercent,
              labels.comfortBand(cataloguePreview.coverage.comfortBand),
            )}
          </p>
          {cataloguePreview.demandingCopy ? (
            <p className="mt-2 text-muted">{cataloguePreview.demandingCopy}</p>
          ) : null}
        </div>
      ) : null}

      {startError ? (
        <p className="text-sm text-danger" role="alert">
          {startError}
        </p>
      ) : null}

      {sessionContract ? <MethodSessionContractText contract={sessionContract} /> : null}

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
        ) : catalogueStartHref && startEnabled ? (
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
