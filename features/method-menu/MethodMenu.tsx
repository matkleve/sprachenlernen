"use client";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
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

import { MethodCard } from "./MethodCard";
import { MethodFilter } from "./MethodFilter";
import { copy, sections } from "./content";
import { useMenuFilter } from "./useMenuFilter";

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
}: MethodMenuProps) {
  const { filter, returnQuery, updateSearchParams } = useMenuFilter(initialSearchParams);
  const methods = catalogue ? filterMethods(catalogue, filter) : [];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>

      <MethodFilter filter={filter} onFilterChange={updateSearchParams} />

      {loadError ? (
        <div className="mt-page-content max-w-2xl">
          <ErrorCallout {...loadError} />
        </div>
      ) : methods.length === 0 ? (
        <p className="mt-page-content max-w-2xl text-base leading-relaxed text-muted">
          {copy.nothingFits}
        </p>
      ) : (
        bySection(methods).map(([section, inSection]) => (
          <section key={section} className="mt-page-content">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
              {sections[section]}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {inSection.map((method) => (
                <li key={method.id}>
                  <MethodCard method={method} returnQuery={returnQuery} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
