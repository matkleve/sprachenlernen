import {
  ENERGY_LABELS,
  SKILL_LABELS,
  defaultTimeBudget,
  type MenuFilter,
} from "@/lib/method-menu-filter";
import { SKILLS } from "@/lib/method-catalogue";
import { timeBudgetToParam } from "@/lib/time-scale";

import { FilterPill } from "@/components/ui/FilterPill";
import { RefineFilter } from "./RefineFilter";
import { TimeSlider } from "./TimeSlider";
import { useMethodMenuCopy } from "./use-method-menu-copy";

type MethodFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
};

const ENERGIES = ["low", "medium", "high"] as const;

export function MethodFilter({ filter, onFilterChange }: MethodFilterProps) {
  const { t } = useMethodMenuCopy();

  return (
    <div className="mt-page-content space-y-8">
      <section aria-label={t("timeLabel")}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {t("timeLabel")}
        </h2>
        <TimeSlider
          value={filter.timeBudget ?? defaultTimeBudget()}
          onChange={(budget) => onFilterChange({ minutes: timeBudgetToParam(budget) })}
        />
      </section>

      <section aria-label={t("skillLabel")}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {t("skillLabel")}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <FilterPill
              current={filter.skill === undefined}
              onClick={() => onFilterChange({ skill: undefined })}
            >
              {t("anySkill")}
            </FilterPill>
          </li>
          {SKILLS.map((skill) => (
            <li key={skill}>
              <FilterPill
                current={filter.skill === skill}
                onClick={() =>
                  onFilterChange({ skill: filter.skill === skill ? undefined : skill })
                }
              >
                {SKILL_LABELS[skill]}
              </FilterPill>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={t("energyLabel")}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {t("energyLabel")}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <FilterPill
              current={filter.energy === undefined}
              onClick={() => onFilterChange({ energy: undefined })}
            >
              {t("anyEnergy")}
            </FilterPill>
          </li>
          {ENERGIES.map((energy) => (
            <li key={energy}>
              <FilterPill
                current={filter.energy === energy}
                onClick={() =>
                  onFilterChange({ energy: filter.energy === energy ? undefined : energy })
                }
              >
                {ENERGY_LABELS[energy]}
              </FilterPill>
            </li>
          ))}
        </ul>
      </section>

      <RefineFilter filter={filter} onFilterChange={onFilterChange} />
    </div>
  );
}
