import type { WoodGrainOptions } from "@/lib/wood-grain-ridges";

export type WoodTexture = {
  id: string;
  number: number;
  name: string;
  marks: readonly string[];
  grain: WoodGrainOptions;
  pill?: boolean;
};

export const woodTextures: readonly WoodTexture[] = [
  {
    id: "raw-planks",
    number: 1,
    name: "Raw planks",
    marks: ["Horizontal fibre layers", "Wide, uneven coarse grain", "High contrast", "Weathered fissures"],
    grain: {
      seed: 11,
      palette: { dark: [42, 28, 16], light: [96, 70, 42] },
      ridgeCount: 9,
      warpAmount: 0.9,
      warpFrequency: 3.2,
      lightStrength: 0.85,
      speckle: 0.05,
      fissureStrength: 0.52,
      fineStretch: 68,
    },
  },
  {
    id: "sanded-bench",
    number: 2,
    name: "Sanded bench",
    marks: ["Horizontal fibre layers", "Softer coarse grain", "Medium contrast"],
    grain: {
      seed: 27,
      palette: { dark: [58, 40, 22], light: [108, 82, 52] },
      ridgeCount: 12,
      warpAmount: 0.6,
      warpFrequency: 4.1,
      lightStrength: 0.55,
      speckle: 0.03,
      fissureStrength: 0.18,
      fineStretch: 56,
    },
  },
  {
    id: "oiled-timber",
    number: 3,
    name: "Oiled timber",
    marks: ["Horizontal fibre layers", "Tight fine grain", "Soft sheen"],
    grain: {
      seed: 44,
      palette: { dark: [70, 46, 24], light: [132, 96, 56] },
      ridgeCount: 16,
      warpAmount: 0.45,
      warpFrequency: 5,
      lightStrength: 0.4,
      speckle: 0.02,
      fissureStrength: 0.08,
      fineStretch: 52,
    },
  },
  {
    id: "stock-bar",
    number: 4,
    name: "Stock bar",
    marks: ["Horizontal fibre layers", "Fine, dense grain", "Rounded profile"],
    grain: {
      seed: 63,
      palette: { dark: [88, 60, 34], light: [152, 112, 68] },
      ridgeCount: 20,
      warpAmount: 0.35,
      warpFrequency: 6,
      lightStrength: 0.35,
      speckle: 0.02,
      fissureStrength: 0.04,
      fineStretch: 48,
    },
    pill: true,
  },
] as const;

export const page = {
  title: "Wood textures",
  intro:
    "Four procedural wood swatches from the progression reference board. Longitudinal plank fibres — fine striations, coarse bands, optional weathered fissures. Grain runs left to right only.",
  grainNote: "Algorithmic longitudinal grain; canvas redraws per size.",
  marksHeading: "Marks",
} as const;
