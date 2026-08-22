import type { WoodGrainOptions } from "@/lib/wood-grain-ridges";
import { tunedWoodVariants } from "@/lib/wood-grain-tuned-variants";

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
    marks: ["Horizontal fibre layers", "Weathered grooves", "High contrast"],
    grain: tunedWoodVariants[9]!.grain,
  },
  {
    id: "sanded-bench",
    number: 2,
    name: "Sanded bench",
    marks: ["Horizontal fibre layers", "Softer grooves", "Medium contrast"],
    grain: {
      seed: 27,
      palette: { dark: [58, 40, 22], light: [108, 82, 52] },
      ridgeCount: 12,
      warpAmount: 0.6,
      warpFrequency: 4.1,
      lightStrength: 0.55,
      speckle: 0.03,
      fissureStrength: 0.22,
      fineStretch: 58,
      grooveStrength: 0.32,
      coarseBandStrength: 0.05,
      fissureSeeds: 4,
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
      fissureStrength: 0.1,
      fineStretch: 54,
      grooveStrength: 0.18,
      coarseBandStrength: 0.06,
      fissureSeeds: 3,
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
      fissureStrength: 0.06,
      fineStretch: 50,
      grooveStrength: 0.12,
      coarseBandStrength: 0.05,
      fissureSeeds: 2,
    },
    pill: true,
  },
] as const;

export const page = {
  title: "Wood textures",
  intro:
    "Algorithmic longitudinal plank grain — fine striations, morphological grooves, sparse fissures. Ten tuned variants plus four reference-board species presets.",
  grainNote: "Canvas redraws per size. No photo or FFT input.",
  tunedHeading: "Ten tuned variants",
  tunedIntro: "Always ten algorithmically tuned weathered-plank explorations. Pick a winner for raw planks.",
  boardHeading: "Reference board species",
  boardIntro: "Four progression reference-board swatches. Raw planks uses tuned variant 10.",
  tunedVariants: tunedWoodVariants,
  marksHeading: "Marks",
} as const;
