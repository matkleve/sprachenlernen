import {
  defaultTimeBudget,
  serializeMultiParam,
  toggleMultiParam,
  type Energy,
  type MenuFilter,
} from "@/lib/method-menu-filter";
import { SKILLS, type Skill } from "@/lib/method-catalogue";
import { timeBudgetToParam } from "@/lib/time-scale";
import { FilterIconPill, FilterPill } from "@/components/ui/FilterPill";
import { EnergyFilterMark, SkillFilterMark } from "./filter-pill-icons";
import { RefineFilter } from "./RefineFilter";
import { TimeSlider } from "./TimeSlider";
import { useMethodMenuCopy } from "./use-method-menu-copy";

type MethodFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
  /** Landing preview omits refine constraints — time, skill, energy only. */
  mode?: "full" | "basic";
};

const ENERGIES = ["low", "medium", "high"] as const;

const ENERGY_LEVEL: Record<(typeof ENERGIES)[number], 1 | 2 | 3> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function MethodFilter({
  filter,
  onFilterChange,
  mode = "full",
}: MethodFilterProps) {
  const { t, skillLabels, intensity } = useMethodMenuCopy();

  const toggleSkill = (skill: Skill) => {
    onFilterChange({ skill: serializeMultiParam(toggleMultiParam(filter.skills, skill)) });
  };

  const toggleEnergy = (energy: Energy) => {
    onFilterChange({ energy: serializeMultiParam(toggleMultiParam(filter.energies, energy)) });
  };

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
              current={!filter.skills?.length}
              onClick={() => onFilterChange({ skill: undefined })}
            >
              {t("anySkill")}
            </FilterPill>
          </li>
          {SKILLS.map((skill) => (
            <li key={skill}>
              <FilterIconPill
                current={filter.skills?.includes(skill) ?? false}
                label={skillLabels[skill]}
                onClick={() => toggleSkill(skill)}
              >
                <SkillFilterMark skill={skill} current={filter.skills?.includes(skill) ?? false} />
              </FilterIconPill>
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
              current={!filter.energies?.length}
              onClick={() => onFilterChange({ energy: undefined })}
            >
              {t("anyEnergy")}
            </FilterPill>
          </li>
          {ENERGIES.map((energy) => (
            <li key={energy}>
              <FilterIconPill
                current={filter.energies?.includes(energy) ?? false}
                label={intensity[ENERGY_LEVEL[energy]]}
                onClick={() => toggleEnergy(energy)}
              >
                <EnergyFilterMark energy={energy} current={filter.energies?.includes(energy) ?? false} />
              </FilterIconPill>
            </li>
          ))}
        </ul>
      </section>

      {mode === "full" ? <RefineFilter filter={filter} onFilterChange={onFilterChange} /> : null}
    </div>
  );
}
