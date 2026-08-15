import { BookOpen, Headphones, Mic, PenLine, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { EvidenceGrade } from "@/lib/method-catalogue";
import type { ContributionLevel, SkillMark } from "@/lib/method-skill-badges";
import type { Skill } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import {
  contributionLabels,
  copy,
  effortCard,
  evidence,
  evidenceCard,
  skillLabels,
} from "./content";

const skillIcons: Record<Skill, LucideIcon> = {
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenLine,
};

const skillTone: Record<Skill, string> = {
  reading: "text-skill-reading bg-skill-reading-soft border-skill-reading",
  listening: "text-skill-listening bg-skill-listening-soft border-skill-listening",
  speaking: "text-skill-speaking bg-skill-speaking-soft border-skill-speaking",
  writing: "text-skill-writing bg-skill-writing-soft border-skill-writing",
};

const textBadgeClass =
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-chip border border-line bg-surface px-2 py-0.5 text-xs font-medium text-ink";

function contributionClass(skill: Skill, level: ContributionLevel): string {
  const tone = skillTone[skill];
  if (level === "primary") return cn(tone, "border");
  if (level === "secondary") return cn(tone, "border border-dashed bg-transparent");
  return cn(tone, "border opacity-60");
}

export type SkillMarkBadgeProps = {
  mark: SkillMark;
};

export function SkillMarkBadge({ mark }: SkillMarkBadgeProps) {
  const Icon = skillIcons[mark.skill];
  const label = `${skillLabels[mark.skill]}, ${contributionLabels[mark.level]}`;

  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-chip",
        contributionClass(mark.skill, mark.level),
      )}
      title={label}
    >
      <Icon className="size-3.5" aria-hidden />
    </span>
  );
}

export type SkillMarksProps = {
  marks: SkillMark[];
  className?: string;
};

export function SkillMarks({ marks, className }: SkillMarksProps) {
  if (marks.length === 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {marks.map((mark) => (
        <SkillMarkBadge key={mark.skill} mark={mark} />
      ))}
    </span>
  );
}

export type EvidenceBadgeProps = {
  grade: EvidenceGrade;
};

export function EvidenceBadge({ grade }: EvidenceBadgeProps) {
  const label = evidenceCard[grade];

  return (
    <span className={textBadgeClass} title={evidence[grade]}>
      {label}
    </span>
  );
}

export type EffortBadgeProps = {
  intensity: 1 | 2 | 3;
};

export function EffortBadge({ intensity }: EffortBadgeProps) {
  const label = effortCard[intensity];

  return (
    <span className={textBadgeClass} title={label}>
      {label}
    </span>
  );
}

export type MethodBadgeRowProps = {
  skillMarks: SkillMark[];
  evidence: EvidenceGrade;
  intensity: 1 | 2 | 3;
  className?: string;
  /** When true, visuals are aria-hidden and a single sr-only line carries the facts (inside links). */
  inLink?: boolean;
};

function badgeSummary(
  skillMarks: SkillMark[],
  evidenceGrade: EvidenceGrade,
  intensity: 1 | 2 | 3,
): string {
  const skills =
    skillMarks.length > 0
      ? skillMarks
          .map((mark) => `${skillLabels[mark.skill]} (${contributionLabels[mark.level]})`)
          .join(", ")
      : "No skill marks";
  return `${skills}. ${evidenceCard[evidenceGrade]}. ${effortCard[intensity]}.`;
}

/** Skill marks, evidence, effort — fixed order per study/27. */
export function MethodBadgeRow({
  skillMarks,
  evidence,
  intensity,
  className,
  inLink = false,
}: MethodBadgeRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {inLink ? (
        <span className="sr-only">{badgeSummary(skillMarks, evidence, intensity)}</span>
      ) : null}
      <div
        className={cn("flex flex-wrap items-center gap-2", inLink && "aria-hidden")}
        {...(inLink ? { "aria-hidden": true } : {})}
      >
        <SkillMarks marks={skillMarks} />
        <EvidenceBadge grade={evidence} />
        <EffortBadge intensity={intensity} />
      </div>
    </div>
  );
}

export type MethodAtAGlanceProps = {
  skillMarks: SkillMark[];
  evidence: EvidenceGrade;
  evidenceDetail: string;
  intensity: 1 | 2 | 3;
  intensityDetail: string;
  children?: ReactNode;
};

export function MethodAtAGlance({
  skillMarks,
  evidence,
  evidenceDetail,
  intensity,
  intensityDetail,
  children,
}: MethodAtAGlanceProps) {
  return (
    <section
      className="mt-6 rounded-card border border-line bg-surface-raised p-4 shadow-soft"
      aria-label={copy.card.atAGlance}
    >
      <MethodBadgeRow
        skillMarks={skillMarks}
        evidence={evidence}
        intensity={intensity}
        className="mb-4"
      />

      <dl className="grid gap-3 text-sm">
        {skillMarks.length > 0 ? (
          <div>
            <dt className="font-medium text-ink">{copy.skillsHeading}</dt>
            <dd className="mt-0.5 text-muted">
              {skillMarks
                .map(
                  (mark) =>
                    `${skillLabels[mark.skill]} (${contributionLabels[mark.level]})`,
                )
                .join(" · ")}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-ink">{copy.card.effort}</dt>
          <dd className="mt-0.5 text-muted">
            {effortCard[intensity]} — {intensityDetail}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">{evidenceCard[evidence]}</dt>
          <dd className="mt-0.5 text-muted">{evidenceDetail}</dd>
        </div>
      </dl>

      {children ? <div className="mt-4 border-t border-line pt-4">{children}</div> : null}
    </section>
  );
}
