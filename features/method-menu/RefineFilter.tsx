import type { MenuFilter } from "@/lib/method-menu-filter";

import { copy, refineOptions } from "./content";
import { FilterPill } from "@/components/ui/FilterPill";

type RefineFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
};

export function RefineFilter({ filter, onFilterChange }: RefineFilterProps) {
  return (
    <details className="rounded-card border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        {copy.refineLabel}
      </summary>
      <p className="mt-2 text-sm text-muted">{copy.refineHint}</p>

      <div className="mt-4 space-y-4">
        {(Object.keys(refineOptions) as Array<keyof typeof refineOptions>).map((dimension) => (
          <section key={dimension} aria-label={copy.refineDimension[dimension]}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
              {copy.refineDimension[dimension]}
            </h3>
            <ul className="flex flex-wrap gap-1">
              <li>
                <FilterPill
                  current={filter.refine[dimension] === undefined}
                  onClick={() => onFilterChange({ [dimension]: undefined })}
                >
                  {copy.refineAny}
                </FilterPill>
              </li>
              {refineOptions[dimension].map(({ value, label }) => {
                const current = filter.refine[dimension] === value;
                return (
                  <li key={value}>
                    <FilterPill
                      current={current}
                      onClick={() =>
                        onFilterChange({ [dimension]: current ? undefined : value })
                      }
                    >
                      {label}
                    </FilterPill>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}
