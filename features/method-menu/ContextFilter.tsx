import { Chip } from "@/components/ui/Chip";
import { NavLink } from "@/components/ui/NavLink";
import { CONTEXT_DIMENSIONS, TIME_BUDGETS } from "@/lib/method-catalogue";
import {
  TIME_BUDGET_LABELS,
  activeTimeBudget,
  buildMethodsHref,
  type MenuFilter,
  type SearchParams,
} from "@/lib/method-menu-filter";

import { copy, dimensionOrder, dimensionValues } from "./content";

type ContextFilterProps = {
  searchParams: SearchParams;
  filter: MenuFilter;
};

const dimensionLabel: Record<keyof typeof CONTEXT_DIMENSIONS, string> = {
  eyes: "Eyes",
  hands: "Hands",
  voice: "Voice",
  writingSurface: "Writing",
  sound: "Sound",
  attention: "Attention",
  company: "Company",
};

export function ContextFilter({ searchParams, filter }: ContextFilterProps) {
  const time = activeTimeBudget(filter);
  const chosenPresetId = filter.kind === "filtered" ? filter.presetId : undefined;

  return (
    <div className="mt-page-content space-y-6">
      <section aria-label={copy.timeLabel}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.timeLabel}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          {TIME_BUDGETS.map((budget) => (
            <li key={budget}>
              <NavLink
                href={buildMethodsHref(searchParams, {
                  context: chosenPresetId,
                  time: time === budget ? undefined : budget,
                })}
                current={time === budget}
              >
                {TIME_BUDGET_LABELS[budget]}
              </NavLink>
            </li>
          ))}
        </ul>
      </section>

      <details className="group rounded-card border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          {copy.customiseLabel}
        </summary>
        <p className="mt-2 text-sm text-muted">{copy.customiseHint}</p>

        <div className="mt-4 space-y-4">
          {dimensionOrder.map((dimension) => (
            <section key={dimension} aria-label={dimensionLabel[dimension]}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
                {dimensionLabel[dimension]}
              </h3>
              <ul className="flex flex-wrap gap-1">
                {CONTEXT_DIMENSIONS[dimension].map((value) => {
                  const label = (dimensionValues[dimension] as Record<string, string>)[value];
                  const current =
                    filter.kind === "filtered" &&
                    !filter.presetId &&
                    filter.context[dimension] === value;

                  return (
                    <li key={value}>
                      <NavLink
                        href={buildMethodsHref(searchParams, {
                          context: undefined,
                          [dimension]: current ? undefined : value,
                        })}
                        current={current}
                      >
                        {label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}
