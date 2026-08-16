import Image from "next/image";

import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";

import { skillTierAriaLabel, skillTierBadgeSrc } from "./skill-tier-badges";

export type SkillTierBadgeProps = {
  skill: Skill;
  tier: Exclude<SkillTier, "wood">;
};

/**
 * One arts tier badge — icon only on screen, words in aria-label.
 * Contract: docs/specs/component/skill-tier-badge.md
 */
export function SkillTierBadge({ skill, tier }: SkillTierBadgeProps) {
  const src = skillTierBadgeSrc(skill, tier);
  const label = skillTierAriaLabel(skill, tier);

  return (
    <span className="inline-flex size-12 shrink-0 items-center justify-center">
      <Image
        src={src}
        alt={label}
        width={48}
        height={48}
        unoptimized
        className="size-12 object-contain"
      />
    </span>
  );
}
