import { NavLink } from "@/components/ui/NavLink";
import { SKILLS } from "@/lib/method-catalogue";
import {
  ENERGY_LABELS,
  SKILL_LABELS,
  buildMethodsHref,
  defaultTimeBudget,
  parseMenuFilter,
  type SearchParams,
} from "@/lib/method-menu-filter";

import { copy } from "./content";
import { RefineFilter } from "./RefineFilter";
import { TimeSlider } from "./TimeSlider";

type MethodFilterProps = {
  searchParams: SearchParams;
};

const ENERGIES = ["low", "medium", "high"] as const;

export function MethodFilter({ searchParams }: MethodFilterProps) {
  const filter = parseMenuFilter(searchParams);

  return (
    <div className="mt-page-content space-y-8">
      <section aria-label={copy.timeLabel}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.timeLabel}
        </h2>
        <TimeSlider searchParams={searchParams} value={filter.timeBudget ?? defaultTimeBudget()} />
      </section>

      <section aria-label={copy.skillLabel}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          {copy.skillLabel}
        </h2>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <NavLink
              href={buildMethodsHref(searchParams, { skill: undefined })}
              current={filter.skill === undefined}
            >
              {copy.anySkill}
            </NavLink>
          </li>
          {SKILLS.map((skill) => (
            <li key={skill}>
              <NavLink
                href={buildMethodsHref(searchParams, {
                  skill: filter.skill === skill ? undefined : skill,
                })}
                current={filter.skill === skill}
              >
                {SKILL_LABELS[skill]}
              </NavLink>
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
            <NavLink
              href={buildMethodsHref(searchParams, { energy: undefined })}
              current={filter.energy === undefined}
            >
              {copy.anyEnergy}
            </NavLink>
          </li>
          {ENERGIES.map((energy) => (
            <li key={energy}>
              <NavLink
                href={buildMethodsHref(searchParams, {
                  energy: filter.energy === energy ? undefined : energy,
                })}
                current={filter.energy === energy}
              >
                {ENERGY_LABELS[energy]}
              </NavLink>
            </li>
          ))}
        </ul>
      </section>

      <RefineFilter searchParams={searchParams} filter={filter} />
    </div>
  );
}
