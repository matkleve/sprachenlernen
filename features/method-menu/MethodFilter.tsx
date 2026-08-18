import {
  ENERGY_LABELS,
  SKILL_LABELS,
  defaultTimeBudget,
  type MenuFilter,
} from "@/lib/method-menu-filter";
import { SKILLS } from "@/lib/method-catalogue";
import { timeBudgetToParam } from "@/lib/time-scale";
import { useTranslations } from "next-intl";

import { FilterPill } from "@/components/ui/FilterPill";
import { RefineFilter } from "./RefineFilter";
import { TimeSlider } from "./TimeSlider";
import { useMethodMenuCopy } from "./use-method-menu-copy";

type MethodFilterProps = {
  filter: MenuFilter;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
  /** Landing preview omits refine constraints — time, skill, energy only. */
  mode?: "full" | "basic";
  listeningDeferred?: boolean;
  onCantListenNow?: () => void;
};

const ENERGIES = ["low", "medium", "high"] as const;

export function MethodFilter({
  filter,
  onFilterChange,
  mode = "full",
  listeningDeferred = false,
  onCantListenNow,
}: MethodFilterProps) {
  const { t } = useMethodMenuCopy();
  const tDefer = useTranslations("listeningDefer");

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

      {mode === "full" ? (
        <>
          <RefineFilter filter={filter} onFilterChange={onFilterChange} />
          <section aria-label={tDefer("sectionLabel")}>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
              {tDefer("sectionLabel")}
            </h2>
            <FilterPill
              current={listeningDeferred}
              onClick={() => {
                if (!listeningDeferred && onCantListenNow) onCantListenNow();
              }}
            >
              {tDefer("cantListenNow")}
            </FilterPill>
          </section>
        </>
      ) : null}
    </div>
  );
}
