import type { Section } from "@/lib/method-catalogue";

/** One abstract header graphic per catalogue section — study/27 card refresh. */
export const sectionGraphicSrc: Record<Section, string> = {
  reading: "/assets/method-sections/method-section-reading.svg",
  listening: "/assets/method-sections/method-section-listening.svg",
  speaking: "/assets/method-sections/method-section-speaking.svg",
  writing: "/assets/method-sections/method-section-writing.svg",
  form: "/assets/method-sections/method-section-form.svg",
  vocabulary: "/assets/method-sections/method-section-vocabulary.svg",
  world: "/assets/method-sections/method-section-world.svg",
  commitments: "/assets/method-sections/method-section-commitments.svg",
};

export function sectionGraphicAlt(section: Section, sectionLabel: string): string {
  return `${sectionLabel} — decorative header`;
}
