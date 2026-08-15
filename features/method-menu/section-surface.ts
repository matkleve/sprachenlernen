import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

const sectionLeftBorder: Record<Section, string> = {
  reading: "border-l-section-reading bg-section-reading-soft",
  listening: "border-l-section-listening bg-section-listening-soft",
  speaking: "border-l-section-speaking bg-section-speaking-soft",
  writing: "border-l-section-writing bg-section-writing-soft",
  form: "border-l-section-form bg-section-form-soft",
  vocabulary: "border-l-section-vocabulary bg-section-vocabulary-soft",
  world: "border-l-section-world bg-section-world-soft",
  commitments: "border-l-section-commitments bg-section-commitments-soft",
};

/** Subtle section tint for method cards — study/27, owner-approved 2026-08-15. */
export function methodSectionSurface(section: Section, className?: string): string {
  return cn("border border-line border-l-4", sectionLeftBorder[section], className);
}
