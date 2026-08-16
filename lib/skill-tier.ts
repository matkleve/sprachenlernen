/**
 * Per-skill contribution tiers for method detail badges.
 * Contract: docs/study/33-skill-tier-badges-exploration.md
 */

import type { MethodEntry, Section, Skill } from "@/lib/method-catalogue";
import {
  type ContributionLevel,
  type SkillMark,
  isWeakTrains,
  skillMarksForMethod,
} from "@/lib/method-skill-badges";

export type SkillTier = "wood" | "bronze" | "silver" | "gold" | "platinum";

export type SkillTierMark = {
  skill: Skill;
  tier: SkillTier;
};

const TIER_ORDER: readonly SkillTier[] = [
  "wood",
  "bronze",
  "silver",
  "gold",
  "platinum",
];

const SECTION_PRIMARY_SKILL: Partial<Record<Section, Skill>> = {
  reading: "reading",
  listening: "listening",
  speaking: "speaking",
  writing: "writing",
};

export function tierRank(tier: SkillTier): number {
  return TIER_ORDER.indexOf(tier);
}

/** Wood exists in the metric but is never shown — avoids discouraging valid methods. */
export function isDisplayTier(tier: SkillTier): boolean {
  return tierRank(tier) >= tierRank("bronze");
}

function tierFromContribution(
  mark: SkillMark,
  method: MethodEntry,
  weak: boolean,
): SkillTier {
  const level: ContributionLevel = mark.level;

  if (level === "slight") {
    return weak ? "wood" : "bronze";
  }

  if (level === "secondary") {
    return "silver";
  }

  const sectionPrimary = SECTION_PRIMARY_SKILL[method.section];
  if (mark.skill === sectionPrimary && method.intensity === 3 && !weak) {
    return "platinum";
  }

  return "gold";
}

/** Full tier map per skill — includes wood for metric completeness. */
export function skillTiersForMethod(method: MethodEntry): SkillTierMark[] {
  const weak = isWeakTrains(method.trains);
  return skillMarksForMethod(method).map((mark) => ({
    skill: mark.skill,
    tier: tierFromContribution(mark, method, weak),
  }));
}

/** Bronze and above only — what the detail badge band renders. */
export function visibleSkillTiers(method: MethodEntry): SkillTierMark[] {
  return skillTiersForMethod(method).filter(({ tier }) => isDisplayTier(tier));
}
