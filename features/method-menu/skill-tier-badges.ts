import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";

import { skillLabels } from "./content";

const TIER_LABEL: Record<Exclude<SkillTier, "wood">, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

/** Raster/SVG path for one skill tier badge asset. */
export function skillTierBadgeSrc(skill: Skill, tier: Exclude<SkillTier, "wood">): string {
  return `/assets/skill-tier-badges/${skill}-${tier}.svg`;
}

export function skillTierAriaLabel(
  skill: Skill,
  tier: Exclude<SkillTier, "wood">,
): string {
  return `${TIER_LABEL[tier]} ${skillLabels[skill]} contribution`;
}
