import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { byId, type MethodEntry } from "@/lib/method-catalogue";
import type { SearchParams } from "@/lib/method-menu-filter";
import { menuQueryString } from "@/lib/method-menu-filter";
import { hasMaterialSetup } from "@/lib/method-material-setup";
import type { MaterialUnitId } from "@/lib/material-unit";
import {
  resolveVariantMinutes,
  showDurationVariantPicker,
} from "@/lib/method-session-budget";
import { resolveSessionContract } from "@/lib/method-session-contract";
import {
  sessionHrefForMethod,
  usesExerciseRunner,
  usesWordsReview,
} from "@/lib/method-session";
import { localizeMethodEntry } from "@/lib/localize-method-entry";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { MethodDetailBadgeBand } from "./MethodDetailBadgeBand";
import { MethodDetailFacts } from "./MethodDetailFacts";
import { MethodDetailHero } from "./MethodDetailHero";
import { MethodDurationPicker } from "./MethodDurationPicker";
import { MethodMaterialSetup } from "./MethodMaterialSetup";
import { MethodSessionContractText } from "./MethodSessionContractText";
import { readMaterialSetupBundle } from "./readMaterialSetup";

export type MethodDetailProps = {
  method?: MethodEntry;
  searchParams?: SearchParams;
};

const backLinkClass =
  "hidden h-auto px-0 text-sm font-medium text-muted hover:bg-transparent hover:text-ink md:inline-flex";

export async function MethodDetail({ method, searchParams = {} }: MethodDetailProps) {
  const t = await getTranslations("methodMenu");
  const backHref = `${routes.methods}${menuQueryString(searchParams)}`;

  if (!method) {
    return (
      <ShellPageContent mode="scrollable-drill-in" width="narrow">
        <p className="text-base text-muted">{t("methodNotFound")}</p>
        <ActionLink
          href={backHref}
          variant="ghost"
          size="sm"
          className={cn(backLinkClass, "mt-4")}
        >
          {t("backToMethods")}
        </ActionLink>
      </ShellPageContent>
    );
  }

  const tMaterial = await getTranslations("methodMaterial");
  const materialLabels = {
    appPick: tMaterial("appPick"),
    own: tMaterial("own"),
    topicLabel: (labelKey: string) => tMaterial(`topics.${labelKey}` as "topics.news"),
    unitLabel: (id: MaterialUnitId, durationSec?: number) =>
      id === "window" && durationSec
        ? tMaterial("units.window", { minutes: Math.round(durationSec / 60) })
        : tMaterial(`units.${id}` as "units.sentence"),
    comfortBand: (band: "demanding" | "comfortable" | "speed") => tMaterial(`comfort.${band}`),
    coverageLine: (coveragePercent: number, bandLabel: string) =>
      tMaterial("coverageLine", { percent: Math.round(coveragePercent), band: bandLabel }),
    demandingLine: (coveragePercent: number, wordsToComfortable: number) =>
      tMaterial("demandingLine", {
        percent: Math.round(coveragePercent),
        words: wordsToComfortable,
      }),
    t1SupportLine: (coveragePercent: number, gapCount: number) =>
      tMaterial("t1SupportLine", {
        percent: Math.round(coveragePercent),
        gaps: gapCount,
      }),
    blockedLine: (coveragePercent: number, targetLevel: string) =>
      tMaterial("blockedLine", {
        percent: Math.round(coveragePercent),
        level: targetLevel,
      }),
    adaptationLabel: (targetLevel: string) => tMaterial("adaptationLabel", { level: targetLevel }),
    appPickPreview: (coveragePercent: number, bandLabel: string) =>
      tMaterial("appPickPreview", { percent: Math.round(coveragePercent), band: bandLabel }),
    emptyTopic: tMaterial("emptyTopic"),
    keepInLibrary: tMaterial("keepInLibrary"),
    uploadFile: tMaterial("uploadFile"),
    pasteText: tMaterial("pasteText"),
    pastePlaceholder: tMaterial("pastePlaceholder"),
    linkUrl: tMaterial("linkUrl"),
  };
  const materialBundle = hasMaterialSetup(method)
    ? await readMaterialSetupBundle(method, materialLabels)
    : { status: "omit" as const };
  const showMaterialSetup = materialBundle.status === "ok";
  const localized = localizeMethodEntry(method, (key) => t(key as "entries.background-listening.name"));
  const variantRaw =
    typeof searchParams.variantMinutes === "string"
      ? searchParams.variantMinutes
      : Array.isArray(searchParams.variantMinutes)
        ? searchParams.variantMinutes[0]
        : undefined;
  const variantMinutes = resolveVariantMinutes(method.durations, {
    selectedVariantRaw: variantRaw,
    methodId: method.id,
  });
  const sessionContract = await resolveSessionContract(method, variantMinutes);
  const showVariantPicker =
    showDurationVariantPicker(method.durations, method.id) && !showMaterialSetup;
  const hasPreStart =
    showMaterialSetup ||
    usesWordsReview(method) ||
    usesExerciseRunner(method);

  return (
    <>
      <MethodDetailHero section={method.section} compact={hasPreStart} />

      <ShellPageContent mode="scrollable-drill-in" width="wide">
        <ActionLink href={backHref} variant="ghost" size="sm" className={cn(backLinkClass, "mb-4")}>
          ← {t("backToMethods")}
        </ActionLink>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
          <article className="min-w-0">
            <h1
              className={cn(
                "font-semibold tracking-tight text-ink",
                hasPreStart
                  ? "text-2xl leading-tight sm:text-3xl md:text-4xl"
                  : "text-3xl sm:text-4xl",
              )}
            >
              {localized.name}
            </h1>

            <p
              className={cn(
                "mt-3 leading-relaxed text-muted",
                hasPreStart ? "text-base md:mt-4 md:text-lg" : "mt-4 text-lg",
              )}
            >
              {localized.summary}
            </p>

            <MethodDetailBadgeBand
              method={method}
              className={cn(hasPreStart ? "mt-3" : "mt-4")}
            />

            {showMaterialSetup ? (
              <MethodMaterialSetup
                method={method}
                context={materialBundle.context}
                canPersist={materialBundle.canPersist}
                variantMinutes={variantMinutes}
                sessionContract={sessionContract}
                className="mt-4 md:mt-6"
              />
            ) : null}

            {!showMaterialSetup && (usesWordsReview(method) || usesExerciseRunner(method)) ? (
              <>
                {showVariantPicker && variantMinutes !== undefined ? (
                  <MethodDurationPicker
                    methodId={method.id}
                    durations={method.durations ?? []}
                    searchParams={searchParams}
                    selectedVariantMinutes={variantMinutes}
                    className="mt-4 md:mt-6"
                  />
                ) : null}
                {sessionContract ? (
                  <MethodSessionContractText
                    contract={sessionContract}
                    className="mt-4 md:mt-6"
                  />
                ) : null}
                <ActionLink
                  href={sessionHrefForMethod(method, { variantMinutes })}
                  variant="primary"
                  size="lg"
                  className={sessionContract ? "mt-3" : "mt-4 md:mt-6"}
                >
                  {t("startSession")}
                </ActionLink>
              </>
            ) : null}

            {method.hosted &&
              !usesWordsReview(method) &&
              !usesExerciseRunner(method) &&
              !showMaterialSetup && (
                <p className="mt-4 text-sm text-muted md:mt-6">{t("sessionNotBuilt")}</p>
              )}

            <MethodDetailFacts method={method} variant="mobile" className="mt-4 md:hidden" />

            <p className="mt-8 text-lg leading-relaxed text-ink">{localized.trains}</p>

            <div className="mt-8 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
              <p className="text-base leading-relaxed text-muted">
                <span className="font-semibold text-ink">{t("card.doesNotDo")}. </span>
                {localized.doesNotDo}
              </p>
            </div>

            <p className="mt-6 text-sm text-muted">
              {method.hosted ? t("hosted") : t("notHosted")}
            </p>
          </article>

          <div className="hidden md:block">
            <MethodDetailFacts method={method} variant="desktop" />
          </div>
        </div>
      </ShellPageContent>
    </>
  );
}

export function findMethod(
  catalogue: { entries: { id: string }[] } | undefined,
  id: string,
): MethodEntry | undefined {
  if (!catalogue) return undefined;
  const entry = byId(catalogue as Parameters<typeof byId>[0], id);
  return entry?.type === "method" ? entry : undefined;
}
