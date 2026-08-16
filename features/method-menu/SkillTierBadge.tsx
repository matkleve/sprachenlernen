"use client";

import Image from "next/image";

import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";

import { useMethodMenuCopy } from "./use-method-menu-copy";
import { skillTierBadgeSrc } from "./skill-tier-badges";

const TIER_LABEL: Record<Exclude<SkillTier, "wood">, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export type SkillTierBadgeProps = {
  skill: Skill;
  tier: Exclude<SkillTier, "wood">;
};

/**
 * One arts tier badge — icon only on screen, words in aria-label.
 * Contract: docs/specs/component/skill-tier-badge.md
 */
export function SkillTierBadge({ skill, tier }: SkillTierBadgeProps) {
  const { skillLabels } = useMethodMenuCopy();
  const src = skillTierBadgeSrc(skill, tier);
  const label = `${TIER_LABEL[tier]} ${skillLabels[skill]} contribution`;

  return (
    <span className="inline-flex size-12 shrink-0 items-center justify-center">
      <Image
        src={src}
        alt={label}
        width={48}
        height={48}
        className="size-12 object-contain"
      />
    </span>
  );
}
