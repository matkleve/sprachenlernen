/**
 * Per-skill value tiers for method badges (evidence + contribution).
 * Contract: docs/specs/service/skill-tier.md (owner revision 2026-08-18).
 */

import type { EvidenceGrade, MethodEntry, Skill } from "@/lib/method-catalogue";
import { SKILLS } from "@/lib/method-catalogue";
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

export type DisplaySkillTierMarks = {
  visible: SkillTierMark[];
  overflow: SkillTierMark[];
};

const TIER_ORDER: readonly SkillTier[] = [
  "wood",
  "bronze",
  "silver",
  "gold",
  "platinum",
];

const SKILL_ORDER: readonly Skill[] = SKILLS;

const MAX_VISIBLE_SHIELDS = 3;

export function tierRank(tier: SkillTier): number {
  return TIER_ORDER.indexOf(tier);
}

function compareSkillTierMarks(a: SkillTierMark, b: SkillTierMark): number {
  const byTier = tierRank(b.tier) - tierRank(a.tier);
  if (byTier !== 0) return byTier;
  return SKILL_ORDER.indexOf(a.skill) - SKILL_ORDER.indexOf(b.skill);
}

function tierFromContribution(
  level: ContributionLevel,
  evidence: EvidenceGrade,
  weak: boolean,
): SkillTier {
  if (level === "slight") {
    if (weak || evidence === "D") return "wood";
    if (evidence === "C") return "bronze";
    return "silver";
  }

  if (level === "secondary") {
    if (evidence === "D" || evidence === "C") return "bronze";
    return "silver";
  }

  if (evidence === "D") return "bronze";
  if (evidence === "C") return "silver";
  if (evidence === "B") return weak ? "silver" : "gold";
  return weak ? "gold" : "platinum";
}

/** Full tier map per skill that the method trains. */
export function skillTiersForMethod(method: MethodEntry): SkillTierMark[] {
  const weak = isWeakTrains(method.trains);
  return skillMarksForMethod(method).map((mark) => ({
    skill: mark.skill,
    tier: tierFromContribution(mark.level, method.evidence, weak),
  }));
}

function applyWoodCrowdingRule(marks: SkillTierMark[]): SkillTierMark[] {
  if (marks.length < 3) return marks;
  return marks.filter((mark) => mark.tier !== "wood");
}

/** Ranked shields for UI — wood dropped when ≥3 qualify; cap at three + overflow. */
export function displaySkillTierMarks(method: MethodEntry): DisplaySkillTierMarks {
  const ranked = [...applyWoodCrowdingRule(skillTiersForMethod(method))].sort(
    compareSkillTierMarks,
  );

  return {
    visible: ranked.slice(0, MAX_VISIBLE_SHIELDS),
    overflow: ranked.slice(MAX_VISIBLE_SHIELDS),
  };
}

/** @deprecated Use displaySkillTierMarks */
export function detailSkillTiers(method: MethodEntry): SkillTierMark[] {
  return displaySkillTierMarks(method).visible;
}

/** @deprecated Use displaySkillTierMarks */
export function visibleSkillTiers(method: MethodEntry): SkillTierMark[] {
  return displaySkillTierMarks(method).visible;
}

export function formatTierOverflowLabel(
  overflow: SkillTierMark[],
  skillLabel: (skill: Skill) => string,
  tierLabel: (tier: SkillTier) => string,
): string {
  if (overflow.length === 0) return "";
  const names = overflow
    .map((mark) => `${tierLabel(mark.tier)} ${skillLabel(mark.skill)}`)
    .join(", ");
  return `${overflow.length} more: ${names}`;
}
