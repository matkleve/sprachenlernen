import {
  BookOpen,
  Gauge,
  Headphones,
  Library,
  Mic,
  Moon,
  PenLine,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Skill } from "@/lib/method-catalogue";
import type { Energy } from "@/lib/method-menu-filter";
import { cn } from "@/lib/utils";

const iconClass = "size-5 shrink-0";

const SKILL_ICON_CLASS: Record<Skill, string> = {
  reading: "text-skill-reading",
  listening: "text-skill-listening",
  speaking: "text-skill-speaking",
  writing: "text-skill-writing",
  vocabulary: "text-section-vocabulary",
};

const SKILL_ICON: Record<Skill, LucideIcon> = {
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenLine,
  vocabulary: Library,
};

const ENERGY_ICON: Record<Energy, LucideIcon> = {
  low: Moon,
  medium: Gauge,
  high: Zap,
};

type FilterMarkProps = {
  icon: LucideIcon;
  className?: string;
};

function FilterMark({ icon: Icon, className }: FilterMarkProps) {
  return <Icon className={cn(iconClass, className)} aria-hidden />;
}

export function SkillFilterMark({ skill, current = false }: { skill: Skill; current?: boolean }) {
  return (
    <FilterMark
      icon={SKILL_ICON[skill]}
      className={current ? "text-accent-ink" : SKILL_ICON_CLASS[skill]}
    />
  );
}

export function EnergyFilterMark({ energy, current = false }: { energy: Energy; current?: boolean }) {
  return (
    <FilterMark
      icon={ENERGY_ICON[energy]}
      className={current ? "text-accent-ink" : "text-ink"}
    />
  );
}
