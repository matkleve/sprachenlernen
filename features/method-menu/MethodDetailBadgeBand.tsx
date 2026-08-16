import type { MethodEntry } from "@/lib/method-catalogue";
import { visibleSkillTiers, type SkillTier } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

import { EffortBadge } from "./MethodBadge";
import { SkillTierBadge } from "./SkillTierBadge";

export type MethodDetailBadgeBandProps = {
  method: MethodEntry;
  className?: string;
};

function isRenderableTier(tier: SkillTier): tier is Exclude<SkillTier, "wood"> {
  return tier !== "wood";
}

/**
 * Skill tier icons (left) and effort (right) under the detail hero.
 * Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailBadgeBand({ method, className }: MethodDetailBadgeBandProps) {
  const tiers = visibleSkillTiers(method);

  return (
    <div
      className={cn(
        "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {tiers.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {tiers.map(({ skill, tier }) =>
            isRenderableTier(tier) ? (
              <SkillTierBadge key={skill} skill={skill} tier={tier} />
            ) : null,
          )}
        </div>
      ) : (
        <div />
      )}
      <EffortBadge intensity={method.intensity} />
    </div>
  );
}
