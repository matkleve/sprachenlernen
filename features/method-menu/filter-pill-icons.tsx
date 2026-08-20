import {
  Activity,
  Battery,
  BookOpen,
  Eye,
  EyeOff,
  Gauge,
  Hand,
  HandMetal,
  Headphones,
  Layers,
  Library,
  Mic,
  Moon,
  PenLine,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Skill } from "@/lib/method-catalogue";
import type { Energy } from "@/lib/method-menu-filter";
import { cn } from "@/lib/utils";

const iconClass = "size-3.5 shrink-0";

const SKILL_TINT: Record<Skill, string> = {
  reading: "bg-skill-reading-soft text-skill-reading",
  listening: "bg-skill-listening-soft text-skill-listening",
  speaking: "bg-skill-speaking-soft text-skill-speaking",
  writing: "bg-skill-writing-soft text-skill-writing",
  vocabulary: "bg-section-vocabulary-soft text-section-vocabulary",
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

const REFINE_VALUE_ICON: Record<string, LucideIcon> = {
  "hands:none": HandMetal,
  "hands:one": Hand,
  "hands:free": Hand,
  "voice:none": VolumeX,
  "voice:quiet": Volume2,
  "voice:aloud": Mic,
  "eyes:free": Eye,
  "eyes:occupied": EyeOff,
};

type FilterIconDiscProps = {
  icon: LucideIcon;
  tintClassName?: string;
  className?: string;
};

function FilterIconDisc({ icon: Icon, tintClassName, className }: FilterIconDiscProps) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
        tintClassName ?? "bg-accent-soft text-accent",
        className,
      )}
      aria-hidden
    >
      <Icon className={iconClass} />
    </span>
  );
}

export function AnySkillFilterIcon() {
  return <FilterIconDisc icon={Layers} />;
}

export function SkillFilterIcon({ skill }: { skill: Skill }) {
  const Icon = SKILL_ICON[skill];
  return <FilterIconDisc icon={Icon} tintClassName={SKILL_TINT[skill]} />;
}

export function AnyEnergyFilterIcon() {
  return <FilterIconDisc icon={Battery} />;
}

export function EnergyFilterIcon({ energy }: { energy: Energy }) {
  const Icon = ENERGY_ICON[energy];
  return <FilterIconDisc icon={Icon} />;
}

export function AnyRefineFilterIcon() {
  return <FilterIconDisc icon={Activity} />;
}

export function RefineValueFilterIcon({
  dimension,
  value,
}: {
  dimension: "hands" | "voice" | "eyes";
  value: string;
}) {
  const Icon = REFINE_VALUE_ICON[`${dimension}:${value}`] ?? Activity;
  return <FilterIconDisc icon={Icon} />;
}
