import type { Section } from "@/lib/method-catalogue";

/** One abstract header graphic per catalogue section — study/27 card refresh. */
export const sectionGraphicSrc: Record<Section, string> = {
  reading: "/assets/method-sections/method-section-reading.webp",
  listening: "/assets/method-sections/method-section-listening.webp",
  speaking: "/assets/method-sections/method-section-speaking.webp",
  writing: "/assets/method-sections/method-section-writing.webp",
  form: "/assets/method-sections/method-section-form.webp",
  vocabulary: "/assets/method-sections/method-section-vocabulary.webp",
  world: "/assets/method-sections/method-section-world.webp",
  commitments: "/assets/method-sections/method-section-commitments.webp",
};

export function sectionGraphicAlt(section: Section, sectionLabel: string): string {
  return `${sectionLabel} — decorative header`;
}
