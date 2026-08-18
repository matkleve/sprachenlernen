"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Dialog } from "@/components/ui/Dialog";
import { MethodBadgeRow } from "@/features/method-menu/MethodBadge";
import { MethodFilter } from "@/features/method-menu/MethodFilter";
import { useMethodMenuCopy } from "@/features/method-menu/use-method-menu-copy";
import { localizeMethodEntry } from "@/lib/localize-method-entry";
import { pickDailyThree } from "@/lib/daily-three";
import {
  applySearchParamUpdates,
  filterMethods,
  parseMenuFilter,
  type SearchParams,
} from "@/lib/method-menu-filter";
import { isMethod, type Catalogue, type MethodEntry } from "@/lib/method-catalogue";

import { LandingPreviewMethodCard } from "./LandingPreviewMethodCard";

export type LandingMethodPreviewProps = {
  catalogue: Catalogue;
  /** ISO `YYYY-MM-DD` — stabilises the three picks for the day. */
  dayKey: string;
};

/**
 * Filterable three-method preview for signed-out visitors. Contract:
 * docs/specs/page/landing.md
 */
export function LandingMethodPreview({ catalogue, dayKey }: LandingMethodPreviewProps) {
  const t = useTranslations("marketing");
  const { t: tMenu } = useMethodMenuCopy();
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [selected, setSelected] = useState<MethodEntry | null>(null);

  const filter = parseMenuFilter(searchParams);
  const methods = filterMethods(catalogue, filter);
  const dailyThree = useMemo(
    () => pickDailyThree(methods.filter(isMethod), dayKey),
    [methods, dayKey],
  );
  const localizedSelected = useMemo(
    () =>
      selected
        ? localizeMethodEntry(selected, (key) => tMenu(key as "entries.background-listening.name"))
        : null,
    [selected, tMenu],
  );

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    setSearchParams((current) => applySearchParamUpdates(current, updates));
    setSelected(null);
  };

  return (
    <section
      className="mt-page-content rounded-card border border-line bg-surface p-6 shadow-soft"
      aria-labelledby="landing-method-preview"
    >
      <h2 id="landing-method-preview" className="text-xl font-semibold text-ink">
        {t("landing.methodPreview.heading")}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
        {t("landing.methodPreview.intro")}
      </p>

      <MethodFilter filter={filter} onFilterChange={updateSearchParams} mode="basic" />

      {dailyThree.length > 0 ? (
        <ul
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={t("landing.methodPreview.methodsLabel")}
        >
          {dailyThree.map((method) => (
            <li key={method.id}>
              <LandingPreviewMethodCard method={method} onSelect={() => setSelected(method)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-base leading-relaxed text-muted">{tMenu("nothingFits")}</p>
      )}

      <p className="mt-4 text-sm text-muted">{t("landing.methodPreview.previewNote")}</p>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={localizedSelected?.name ?? ""}
        description={localizedSelected?.summary}
        className="w-[min(40rem,calc(100vw-2rem))]"
      >
        {localizedSelected ? (
          <>
            <MethodBadgeRow className="mt-2" method={selected!} />
            <p className="mt-4 text-base leading-relaxed text-ink">{localizedSelected.trains}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              <span className="font-medium text-ink">{tMenu("card.doesNotDo")}: </span>
              {localizedSelected.doesNotDo}
            </p>
          </>
        ) : null}
      </Dialog>
    </section>
  );
}
