import {
  ENERGY_LABELS,
  SKILL_LABELS,
  defaultTimeBudget,
  serializeMultiParam,
  toggleMultiParam,
  type Energy,
  type MenuFilter,
} from "@/lib/method-menu-filter";
import { SKILLS, type Skill } from "@/lib/method-catalogue";
import { timeBudgetToParam } from "@/lib/time-scale";
import { FilterPill } from "@/components/ui/FilterPill";
import {
  AnyEnergyFilterIcon,
  AnySkillFilterIcon,
  EnergyFilterIcon,
  SkillFilterIcon,
} from "./filter-pill-icons";
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

export function MethodFilter({
  filter,
  onFilterChange,
  mode = "full",
}: MethodFilterProps) {
  const { t } = useMethodMenuCopy();

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
              icon={<AnySkillFilterIcon />}
              onClick={() => onFilterChange({ skill: undefined })}
            >
              {t("anySkill")}
            </FilterPill>
          </li>
          {SKILLS.map((skill) => (
            <li key={skill}>
              <FilterPill
                current={filter.skills?.includes(skill) ?? false}
                icon={<SkillFilterIcon skill={skill} />}
                onClick={() => toggleSkill(skill)}
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
              current={!filter.energies?.length}
              icon={<AnyEnergyFilterIcon />}
              onClick={() => onFilterChange({ energy: undefined })}
            >
              {t("anyEnergy")}
            </FilterPill>
          </li>
          {ENERGIES.map((energy) => (
            <li key={energy}>
              <FilterPill
                current={filter.energies?.includes(energy) ?? false}
                icon={<EnergyFilterIcon energy={energy} />}
                onClick={() => toggleEnergy(energy)}
              >
                {ENERGY_LABELS[energy]}
              </FilterPill>
            </li>
          ))}
        </ul>
      </section>

      {mode === "full" ? <RefineFilter filter={filter} onFilterChange={onFilterChange} /> : null}
    </div>
  );
}
