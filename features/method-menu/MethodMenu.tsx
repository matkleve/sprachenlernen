"use client";

import { useMemo } from "react";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { pickDailyThree } from "@/lib/daily-three";
import type { DemonstrationSentencePick } from "@/lib/demonstration-sentence";
import type { UserFacingError } from "@/lib/errors";
import {
  SECTIONS,
  isMethod,
  type Catalogue,
  type MethodEntry,
  type Preset,
  type Section,
} from "@/lib/method-catalogue";
import { filterMethods } from "@/lib/method-menu-filter";
import type { SearchParams } from "@/lib/method-menu-filter";

import { DemonstrationSentence } from "./DemonstrationSentence";
import { ListeningDeferNotice } from "./ListeningDeferNotice";
import { MethodCard } from "./MethodCard";
import { MethodFilter } from "./MethodFilter";
import { CurrentStanding } from "./CurrentStanding";
import type { StandingSummary } from "./standing";
import { useListeningDefer } from "./useListeningDefer";
import { useMenuFilter } from "./useMenuFilter";
import { useMethodMenuCopy } from "./use-method-menu-copy";

/**
 * The app's front door: the catalogue, filtered by three questions. Contract:
 * docs/specs/page/method-menu.md
 *
 * Client component: the catalogue loads once on the server; every filter change
 * re-renders in memory — no round trip, no scroll reset.
 */

export type MethodMenuProps = {
  catalogue?: Catalogue;
  presets?: Preset[];
  loadError?: UserFacingError;
  initialSearchParams?: SearchParams;
  standing?: StandingSummary;
  demonstration?: DemonstrationSentencePick;
  /** ISO date `YYYY-MM-DD` — stabilises daily-three picks for the day. */
  dayKey?: string;
};

const bySection = (methods: MethodEntry[]): [Section, MethodEntry[]][] =>
  SECTIONS.map((section): [Section, MethodEntry[]] => [
    section,
    methods.filter((method) => method.section === section),
  ]).filter(([, inSection]) => inSection.length > 0);

export function MethodMenu({
  catalogue,
  presets: _presets = [],
  loadError,
  initialSearchParams = {},
  standing,
  demonstration,
  dayKey = new Date().toISOString().slice(0, 10),
}: MethodMenuProps) {
  const { t, sections } = useMethodMenuCopy();
  const { filter, returnQuery, updateSearchParams } = useMenuFilter(initialSearchParams);
  const { deferred, expiry, startDefer, clearDefer } = useListeningDefer();
  const methods = catalogue
    ? filterMethods(catalogue, filter, { deferListening: deferred })
    : [];
  const dailyThree = useMemo(
    () => pickDailyThree(methods.filter(isMethod), dayKey),
    [methods, dayKey],
  );

  return (
    <ShellPageContent width="wide">
      <p className="max-w-2xl text-base leading-relaxed text-muted">{t("intro")}</p>

      {standing ? <CurrentStanding summary={standing} /> : null}

      {demonstration ? <DemonstrationSentence pick={demonstration} /> : null}

      {!loadError && dailyThree.length > 0 ? (
        <section className="mt-6" aria-label={t("dailyHeading")}>
          <h2 className="text-xl font-semibold text-ink">{t("dailyHeading")}</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{t("dailyIntro")}</p>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dailyThree.map((method) => (
              <li key={method.id}>
                <MethodCard method={method} returnQuery={returnQuery} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MethodFilter
        filter={filter}
        onFilterChange={updateSearchParams}
        listeningDeferred={deferred}
        onCantListenNow={startDefer}
      />

      {deferred && expiry ? (
        <ListeningDeferNotice expiry={expiry} onClear={clearDefer} />
      ) : null}

      {loadError ? (
        <div className="mt-page-content max-w-2xl">
          <ErrorCallout {...loadError} />
        </div>
      ) : methods.length === 0 ? (
        <p className="mt-page-content max-w-2xl text-base leading-relaxed text-muted">
          {t("nothingFits")}
        </p>
      ) : (
        bySection(methods).map(([section, inSection]) => (
          <section key={section} className="mt-page-content">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
              {sections[section]}
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {inSection.map((method) => (
                <li key={method.id}>
                  <MethodCard method={method} returnQuery={returnQuery} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </ShellPageContent>
  );
}
