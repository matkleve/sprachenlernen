import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { NavLink } from "@/components/ui/NavLink";
import type { UserFacingError } from "@/lib/errors";
import {
  SECTIONS,
  filterByContext,
  isMethod,
  type Catalogue,
  type MethodEntry,
  type Preset,
  type Section,
} from "@/lib/method-catalogue";

import { routes } from "@/lib/routes";

import { MethodCard } from "./MethodCard";
import { copy, sections } from "./content";

/**
 * The app's front door: the catalogue, filtered by context. Contract:
 * docs/specs/page/method-menu.md
 *
 * A Server Component holding no state. The one thing that changes — which
 * context you are in — lives in the URL, so the two surfaces it drives (the
 * chosen chip and the list of Methods) are both derived from the same value in
 * the same render. docs/STATE.md §6's coherence contract holds structurally
 * rather than by anyone remembering to keep them in step.
 *
 * This is not the Daily menu. That is three Methods composed from floors,
 * effect and preference, two of which no code produces yet — so this page
 * deliberately does not rank. See the spec's § Open questions.
 */

export type MethodMenuProps = {
  catalogue?: Catalogue;
  presets?: Preset[];
  /** Set when the catalogue refused to load — user copy only, detail is in logs. */
  loadError?: UserFacingError;
  /** The raw `?context=` value. Not assumed to name a preset that exists. */
  context?: string;
};

const bySection = (methods: MethodEntry[]): [Section, MethodEntry[]][] =>
  SECTIONS.map((section): [Section, MethodEntry[]] => [
    section,
    methods.filter((method) => method.section === section),
  ]).filter(([, inSection]) => inSection.length > 0);

export function MethodMenu({ catalogue, presets = [], loadError, context }: MethodMenuProps) {
  const chosen = context ? presets.find((preset) => preset.id === context) : undefined;
  const unknownContext = context !== undefined && chosen === undefined;

  const methods = catalogue
    ? chosen
      ? filterByContext(catalogue, chosen.context)
      : catalogue.entries.filter(isMethod)
    : [];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>

      <nav aria-label={copy.contextLabel} className="mt-page-content">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.contextLabel}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <NavLink href={routes.methods} current={chosen === undefined}>
              {copy.anyContext}
            </NavLink>
          </li>
          {presets.map((preset) => (
            <li key={preset.id}>
              <NavLink
                href={
                  chosen?.id === preset.id
                    ? routes.methods
                    : `${routes.methods}?context=${preset.id}`
                }
                current={chosen?.id === preset.id}
              >
                {preset.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {unknownContext && (
        <p className="mt-page-content max-w-2xl text-base leading-relaxed text-muted">
          {copy.unknownContext}
        </p>
      )}

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
            <ul className="grid gap-4 sm:grid-cols-2">
              {inSection.map((method) => (
                <li key={method.id}>
                  <MethodCard method={method} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
