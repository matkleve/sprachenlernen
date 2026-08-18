"use client";

import type { MethodEntry } from "@/lib/method-catalogue";
import { displaySkillTierMarks } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

import { EffortBadge } from "./MethodBadge";
import { SkillTierBadgeRow } from "./SkillTierBadge";

export type MethodDetailBadgeBandProps = {
  method: MethodEntry;
  className?: string;
};

/**
 * Ranked skill tier shields (≤3 + overflow) and effort label + dot scale.
 * Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailBadgeBand({ method, className }: MethodDetailBadgeBandProps) {
  const { visible, overflow } = displaySkillTierMarks(method);
  const hasTiers = visible.length > 0 || overflow.length > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <SkillTierBadgeRow visible={visible} overflow={overflow} size="detail" />
      <span className={cn("inline-flex flex-wrap items-center gap-2", hasTiers && "sm:ml-auto")}>
        <EffortBadge intensity={method.intensity} size="card" />
      </span>
    </div>
  );
}
