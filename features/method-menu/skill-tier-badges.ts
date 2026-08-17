import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";

/** Raster/SVG path for one skill tier badge asset. */
export function skillTierBadgeSrc(skill: Skill, tier: SkillTier): string {
  return `/assets/skill-tier-badges/${skill}-${tier}.svg`;
}

/** @deprecated Use SkillTierBadge — aria label now comes from next-intl in the component. */
export function skillTierAriaLabel(
  skill: Skill,
  tier: Exclude<SkillTier, "wood">,
): string {
  return `${tier} ${skill} contribution`;
}
