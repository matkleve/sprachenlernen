import { Disclosure, DisclosurePanel, DisclosureSummary } from "@/components/ui/Disclosure";
import { FilterPill } from "@/components/ui/FilterPill";
import type { MenuFilter } from "@/lib/method-menu-filter";

import { copy, refineOptions } from "./content";

type RefineFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
};

export function RefineFilter({ filter, onFilterChange }: RefineFilterProps) {
  return (
    <Disclosure className="p-0">
      <DisclosureSummary>{copy.refineLabel}</DisclosureSummary>
      <DisclosurePanel>
        <div className="border-t border-line px-4 pb-4 pt-3">
          <p className="text-sm text-muted">{copy.refineHint}</p>

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
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
