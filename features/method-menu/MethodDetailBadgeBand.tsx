import type { MethodEntry } from "@/lib/method-catalogue";
import { visibleSkillTiers, type SkillTier } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

import { EvidenceBadge, EffortScale } from "./MethodBadge";
import { SkillTierBadge } from "./SkillTierBadge";

export type MethodDetailBadgeBandProps = {
  method: MethodEntry;
  className?: string;
};

function isRenderableTier(tier: SkillTier): tier is Exclude<SkillTier, "wood"> {
  return tier !== "wood";
}

/**
 * Skill tier icons, evidence, and effort scale — always visible on detail.
 * Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailBadgeBand({ method, className }: MethodDetailBadgeBandProps) {
  const tiers = visibleSkillTiers(method);
  const hasTiers = tiers.some(({ tier }) => isRenderableTier(tier));

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tiers.map(({ skill, tier }) =>
        isRenderableTier(tier) ? (
          <SkillTierBadge key={skill} skill={skill} tier={tier} />
        ) : null,
      )}
      <span className={cn("inline-flex flex-wrap items-center gap-2", hasTiers && "sm:ml-auto")}>
        <EvidenceBadge grade={method.evidence} />
        <EffortScale intensity={method.intensity} />
      </span>
    </div>
  );
}
