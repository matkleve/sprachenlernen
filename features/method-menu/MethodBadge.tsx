"use client";

import { cva, type VariantProps } from "class-variance-authority";

import type { MethodEntry } from "@/lib/method-catalogue";
import { displaySkillTierMarks } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

import { useMethodMenuCopy } from "./use-method-menu-copy";
import { SkillTierBadgeRow } from "./SkillTierBadge";

const effortBadgeVariants = cva(
  "inline-flex shrink-0 items-center whitespace-nowrap font-medium text-muted",
  {
    variants: {
      size: {
        default: "text-xs",
        card: "min-h-8 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const effortDotVariants = cva("rounded-full", {
  variants: {
    size: {
      default: "size-1.5",
      card: "size-2",
    },
  },
  defaultVariants: { size: "default" },
});

export type EffortBadgeProps = {
  intensity: 1 | 2 | 3;
  className?: string;
} & VariantProps<typeof effortBadgeVariants>;

export function EffortBadge({ intensity, size, className }: EffortBadgeProps) {
  const { t, intensity: intensityAnchors } = useMethodMenuCopy();
  const label = t("card.effort");
  const anchor = intensityAnchors[intensity];
  const ariaLabel = `${label}: ${intensity} of 3 — ${anchor}`;

  return (
    <span
      className={cn(effortBadgeVariants({ size }), className)}
      aria-label={ariaLabel}
      title={anchor}
    >
      <span>{label}</span>
      <span className="ml-2 inline-flex gap-1" aria-hidden>
        {([1, 2, 3] as const).map((level) => (
          <span
            key={level}
            className={cn(
              effortDotVariants({ size }),
              level <= intensity ? "bg-ink" : "bg-line",
            )}
          />
        ))}
      </span>
    </span>
  );
}

export type MethodBadgeRowProps = {
  method: MethodEntry;
  className?: string;
  /** When true, visuals are aria-hidden and a single sr-only line carries the facts (inside links). */
  inLink?: boolean;
};

function badgeSummary(
  visibleLabel: string,
  overflowLabel: string,
  intensity: 1 | 2 | 3,
  intensityAnchors: ReturnType<typeof useMethodMenuCopy>["intensity"],
): string {
  const tiers =
    visibleLabel.length > 0
      ? overflowLabel.length > 0
        ? `${visibleLabel}. ${overflowLabel}`
        : visibleLabel
      : "No skill tiers";
  return `${tiers}. Effort ${intensity} of 3 — ${intensityAnchors[intensity]}.`;
}

function tierSummary(
  marks: { skill: string; tier: string }[],
  skillLabels: ReturnType<typeof useMethodMenuCopy>["skillLabels"],
): string {
  return marks
    .map((mark) => `${skillLabels[mark.skill as keyof typeof skillLabels]} (${mark.tier})`)
    .join(", ");
}

/** Tier shields left, effort right — fixed order per skill-tier spec. */
export function MethodBadgeRow({ method, className, inLink = false }: MethodBadgeRowProps) {
  const { skillLabels, intensity: intensityAnchors } = useMethodMenuCopy();
  const { visible, overflow } = displaySkillTierMarks(method);
  const visibleLabel = tierSummary(visible, skillLabels);
  const overflowLabel =
    overflow.length > 0
      ? `${overflow.length} more skills: ${tierSummary(overflow, skillLabels)}`
      : "";

  return (
    <div className={cn("w-full", className)}>
      {inLink ? (
        <span className="sr-only">
          {badgeSummary(visibleLabel, overflowLabel, method.intensity, intensityAnchors)}
        </span>
      ) : null}
      <div
        className={cn("flex w-full items-center gap-2", inLink && "aria-hidden")}
        {...(inLink ? { "aria-hidden": true } : {})}
      >
        <SkillTierBadgeRow visible={visible} overflow={overflow} size="card" />
        <EffortBadge className="ml-auto" intensity={method.intensity} size="card" />
      </div>
    </div>
  );
}
