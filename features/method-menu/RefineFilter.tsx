import { Disclosure, DisclosurePanel, DisclosureSummary } from "@/components/ui/Disclosure";
import { FilterPill } from "@/components/ui/FilterPill";
import {
  serializeMultiParam,
  toggleMultiParam,
  type MenuFilter,
  type RefineDimension,
} from "@/lib/method-menu-filter";

import { useMethodMenuCopy } from "./use-method-menu-copy";

type RefineFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
};

export function RefineFilter({ filter, onFilterChange }: RefineFilterProps) {
  const { t, refineOptions } = useMethodMenuCopy();

  const toggleRefine = (dimension: RefineDimension, value: string) => {
    onFilterChange({
      [dimension]: serializeMultiParam(toggleMultiParam(filter.refine[dimension], value)),
    });
  };

  return (
    <Disclosure className="p-0">
      <DisclosureSummary>{t("refineLabel")}</DisclosureSummary>
      <DisclosurePanel>
        <div className="border-t border-line px-4 pb-4 pt-3">
          <p className="text-sm text-muted">{t("refineHint")}</p>

          <div className="mt-4 space-y-4">
            {(Object.keys(refineOptions) as Array<keyof typeof refineOptions>).map((dimension) => (
              <section key={dimension} aria-label={t(`refineDimension.${dimension}`)}>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
                  {t(`refineDimension.${dimension}`)}
                </h3>
                <ul className="flex flex-wrap gap-1">
                  <li>
                    <FilterPill
                      current={!filter.refine[dimension]?.length}
                      onClick={() => onFilterChange({ [dimension]: undefined })}
                    >
                      {t("refineAny")}
                    </FilterPill>
                  </li>
                  {refineOptions[dimension].map(({ value, label }) => {
                    const current = filter.refine[dimension]?.includes(value) ?? false;
                    return (
                      <li key={value}>
                        <FilterPill current={current} onClick={() => toggleRefine(dimension, value)}>
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
