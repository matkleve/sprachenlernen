import { NavLink } from "@/components/ui/NavLink";
import { SKILLS } from "@/lib/method-catalogue";
import { SKILL_LABELS, buildMethodsHref, parseSkill, type SearchParams } from "@/lib/method-menu-filter";

import { copy } from "./content";

type SkillFilterProps = {
  searchParams: SearchParams;
};

export function SkillFilter({ searchParams }: SkillFilterProps) {
  const active = parseSkill(searchParams);

  return (
    <section aria-label={copy.skillLabel} className="mt-page-content">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
        {copy.skillLabel}
      </h2>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <NavLink
            href={buildMethodsHref(searchParams, { skill: undefined })}
            current={active === undefined}
          >
            {copy.anySkill}
          </NavLink>
        </li>
        {SKILLS.map((skill) => (
          <li key={skill}>
            <NavLink
              href={buildMethodsHref(searchParams, {
                skill: active === skill ? undefined : skill,
              })}
              current={active === skill}
            >
              {SKILL_LABELS[skill]}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
