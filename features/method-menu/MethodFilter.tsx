import {
  ENERGY_LABELS,
  SKILL_LABELS,
  type MenuFilter,
} from "@/lib/method-menu-filter";
import { SKILLS } from "@/lib/method-catalogue";

import { copy } from "./content";
import { FilterPill } from "./FilterPill";
import { RefineFilter } from "./RefineFilter";
import { TimeSlider } from "./TimeSlider";

type MethodFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
};

const ENERGIES = ["low", "medium", "high"] as const;

export function MethodFilter({ filter, onFilterChange }: MethodFilterProps) {
  return (
    <div className="mt-page-content space-y-8">
      <section aria-label={copy.timeLabel}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.timeLabel}
        </h2>
        <TimeSlider
          value={filter.minutes ?? 15}
          onChange={(minutes) => onFilterChange({ minutes: String(minutes) })}
        />
      </section>

      <section aria-label={copy.skillLabel}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.skillLabel}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <FilterPill
              current={filter.skill === undefined}
              onClick={() => onFilterChange({ skill: undefined })}
            >
              {copy.anySkill}
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

      <section aria-label={copy.energyLabel}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.energyLabel}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <FilterPill
              current={filter.energy === undefined}
              onClick={() => onFilterChange({ energy: undefined })}
            >
              {copy.anyEnergy}
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
