import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

const sectionBackground: Record<Section, string> = {
  reading: "bg-section-reading-soft",
  listening: "bg-section-listening-soft",
  speaking: "bg-section-speaking-soft",
  writing: "bg-section-writing-soft",
  form: "bg-section-form-soft",
  vocabulary: "bg-section-vocabulary-soft",
  world: "bg-section-world-soft",
  commitments: "bg-section-commitments-soft",
};

/** Card shell — uniform border, no accent stripe (owner: border + radius clash). */
export function methodSectionSurface(section: Section, className?: string): string {
  return cn("overflow-hidden border border-line bg-surface", sectionBackground[section], className);
}
