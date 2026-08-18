import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";

const RASTER_SKILLS = new Set<Skill>(["reading", "listening", "speaking", "writing"]);

/** Raster path for core skills; vocabulary keeps SVG placeholder until art exists. */
export function skillTierBadgeSrc(skill: Skill, tier: SkillTier): string {
  const ext = RASTER_SKILLS.has(skill) ? "png" : "svg";
  return `/assets/skill-tier-badges/${skill}-${tier}.${ext}`;
}
