/**
 * Derives skill contribution marks for method badges.
 * Contract: docs/study/27-method-badges.md, docs/specs/component/method-badge.md
 */

import {
  SKILLS,
  type MethodEntry,
  type Section,
  type Skill,
} from "@/lib/method-catalogue";

export type ContributionLevel = "primary" | "secondary" | "slight";

export type SkillMark = {
  skill: Skill;
  level: ContributionLevel;
};

const SECTION_PRIMARY_SKILL: Partial<Record<Section, Skill>> = {
  reading: "reading",
  listening: "listening",
  speaking: "speaking",
  writing: "writing",
};

/** Weak-yield methods downgrade every skill mark (study/21 background listening). */
export function isWeakTrains(trains: string): boolean {
  const normalized = trains.toLowerCase();
  return (
    normalized.includes("very little") ||
    normalized.includes("barely") ||
    normalized.startsWith("honestly")
  );
}

function downgrade(level: ContributionLevel): ContributionLevel {
  if (level === "primary") return "slight";
  if (level === "secondary") return "slight";
  return "slight";
}

/** Catalogue order: reading → listening → speaking → writing. */
export function skillMarksForMethod(method: MethodEntry): SkillMark[] {
  const weak = isWeakTrains(method.trains);
  const primaryFromSection = SECTION_PRIMARY_SKILL[method.section];
  const marks = new Map<Skill, ContributionLevel>();

  if (primaryFromSection) {
    marks.set(primaryFromSection, weak ? "slight" : "primary");
  }

  for (const skill of method.skills) {
    if (marks.has(skill)) continue;
    if (skill === primaryFromSection) {
      marks.set(skill, weak ? "slight" : "primary");
      continue;
    }
    marks.set(skill, weak ? "slight" : "secondary");
  }

  if (marks.size === 0 && method.skills.length > 0) {
    const [first, ...rest] = method.skills;
    if (first) {
      marks.set(first, weak ? "slight" : "primary");
      for (const skill of rest) {
        marks.set(skill, weak ? "slight" : "secondary");
      }
    }
  }

  if (weak) {
    for (const [skill, level] of marks) {
      marks.set(skill, downgrade(level));
    }
  }

  return SKILLS.filter((skill) => marks.has(skill)).map((skill) => ({
    skill,
    level: marks.get(skill)!,
  }));
}
