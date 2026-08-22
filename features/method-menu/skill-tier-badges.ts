import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";

const RASTER_SKILLS = new Set<Skill>(["reading", "listening", "speaking", "writing"]);

export type SkillTierBadgeSurface = "card" | "detail";

/** Raster path for core skills; vocabulary keeps SVG placeholder until art exists. */
export function skillTierBadgeSrc(
  skill: Skill,
  tier: SkillTier,
  surface: SkillTierBadgeSurface = "detail",
): string {
  if (RASTER_SKILLS.has(skill)) {
    const suffix = surface === "card" ? "-card" : "";
    return `/assets/skill-tier-badges/${skill}-${tier}${suffix}.png`;
  }
  return `/assets/skill-tier-badges/${skill}-${tier}.svg`;
}
