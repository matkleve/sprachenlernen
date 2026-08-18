"use client";

import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import type { Skill } from "@/lib/method-catalogue";
import type { SkillTier, SkillTierMark } from "@/lib/skill-tier";
import { formatTierOverflowLabel } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

import { useMethodMenuCopy } from "./use-method-menu-copy";
import { skillTierBadgeSrc } from "./skill-tier-badges";

const TIER_LABEL: Record<SkillTier, string> = {
  wood: "Wood",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

const skillTierBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center",
  {
    variants: {
      size: {
        card: "size-7",
        detail: "size-12",
      },
    },
    defaultVariants: {
      size: "detail",
    },
  },
);

const skillTierImageVariants = cva("object-contain", {
  variants: {
    size: {
      card: "size-7",
      detail: "size-12",
    },
  },
  defaultVariants: {
    size: "detail",
  },
});

export type SkillTierBadgeProps = {
  skill: Skill;
  tier: SkillTier;
  className?: string;
} & VariantProps<typeof skillTierBadgeVariants>;

export function SkillTierBadge({ skill, tier, size, className }: SkillTierBadgeProps) {
  const { skillLabels } = useMethodMenuCopy();
  const src = skillTierBadgeSrc(skill, tier);
  const label = `${TIER_LABEL[tier]} ${skillLabels[skill]}`;
  const px = size === "card" ? 28 : 48;

  return (
    <span className={cn(skillTierBadgeVariants({ size }), className)}>
      <Image
        src={src}
        alt={label}
        width={px}
        height={px}
        unoptimized
        className={skillTierImageVariants({ size })}
      />
    </span>
  );
}

export type SkillTierOverflowProps = {
  overflow: SkillTierMark[];
  size?: "card" | "detail";
  className?: string;
};

export function SkillTierOverflow({
  overflow,
  size = "detail",
  className,
}: SkillTierOverflowProps) {
  const { skillLabels } = useMethodMenuCopy();

  if (overflow.length === 0) return null;

  const label = formatTierOverflowLabel(
    overflow,
    (skill) => skillLabels[skill],
    (tier) => TIER_LABEL[tier],
  );

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-chip border border-line bg-surface font-medium text-muted",
        size === "card" ? "size-7 text-xs" : "size-12 text-sm",
        className,
      )}
      title={label}
      aria-label={label}
    >
      +{overflow.length}
    </span>
  );
}

export type SkillTierBadgeRowProps = {
  visible: SkillTierMark[];
  overflow: SkillTierMark[];
  size?: "card" | "detail";
  className?: string;
};

export function SkillTierBadgeRow({
  visible,
  overflow,
  size = "detail",
  className,
}: SkillTierBadgeRowProps) {
  if (visible.length === 0 && overflow.length === 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {visible.map((mark) => (
        <SkillTierBadge key={mark.skill} skill={mark.skill} tier={mark.tier} size={size} />
      ))}
      <SkillTierOverflow overflow={overflow} size={size} />
    </span>
  );
}
