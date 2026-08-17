import type { MethodEntry } from "@/lib/method-catalogue";
import { detailSkillTiers } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

import { EffortBadge } from "./MethodBadge";
import { SkillTierBadge } from "./SkillTierBadge";

export type MethodDetailBadgeBandProps = {
  method: MethodEntry;
  className?: string;
};

/**
 * Skill tier icons and plain effort label — evidence stays in Practical disclosure.
 * Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailBadgeBand({ method, className }: MethodDetailBadgeBandProps) {
  const tiers = detailSkillTiers(method);
  const hasTiers = tiers.length > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tiers.map(({ skill, tier }) => (
        <SkillTierBadge key={skill} skill={skill} tier={tier} />
      ))}
      <span className={cn("inline-flex flex-wrap items-center gap-2", hasTiers && "sm:ml-auto")}>
        <EffortBadge intensity={method.intensity} />
      </span>
    </div>
  );
}
