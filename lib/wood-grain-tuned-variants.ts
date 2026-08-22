import type { WoodGrainOptions } from "@/lib/wood-grain-ridges";
import { WOOD_TUNED_VARIANT_COUNT } from "@/lib/wood-grain-ridges";

export type TunedWoodVariant = {
  id: string;
  number: number;
  name: string;
  note: string;
  grain: WoodGrainOptions;
};

/** Weathered grey-brown palettes for longitudinal plank tuning. */
const weathered = {
  charcoal: { dark: [22, 20, 18] as const, light: [108, 100, 94] as const },
  umber: { dark: [32, 26, 22] as const, light: [118, 108, 98] as const },
  drift: { dark: [28, 24, 20] as const, light: [102, 96, 88] as const },
  ash: { dark: [26, 22, 19] as const, light: [112, 104, 96] as const },
  soot: { dark: [18, 16, 14] as const, light: [98, 92, 86] as const },
};

/**
 * Ten hand-tuned algorithmic variants — always shown on `/dev/wood-textures`.
 * Each explores a different fibre / groove / fissure balance toward weathered plank.
 */
export const tunedWoodVariants: readonly TunedWoodVariant[] = [
  {
    id: "tuned-01",
    number: 1,
    name: "Dense fine fibre",
    note: "High fine stretch, grooves low — tight striations only",
    grain: {
      seed: 101,
      palette: weathered.drift,
      ridgeCount: 11,
      warpAmount: 0.55,
      warpFrequency: 3.4,
      lightStrength: 0.72,
      speckle: 0.04,
      fineStretch: 82,
      fissureStrength: 0.32,
      grooveStrength: 0.28,
      coarseBandStrength: 0.02,
      fissureSeeds: 4,
    },
  },
  {
    id: "tuned-02",
    number: 2,
    name: "Mid seam",
    note: "One dominant horizontal fissure bias via seed + strong grooves",
    grain: {
      seed: 217,
      palette: weathered.charcoal,
      ridgeCount: 9,
      warpAmount: 0.72,
      warpFrequency: 2.9,
      lightStrength: 0.78,
      speckle: 0.03,
      fineStretch: 74,
      fissureStrength: 0.58,
      grooveStrength: 0.62,
      coarseBandStrength: 0.03,
      fissureSeeds: 3,
    },
  },
  {
    id: "tuned-03",
    number: 3,
    name: "Shredded fibre",
    note: "Heavy morphological grooves, many short cracks",
    grain: {
      seed: 333,
      palette: weathered.soot,
      ridgeCount: 10,
      warpAmount: 0.82,
      warpFrequency: 3.1,
      lightStrength: 0.85,
      speckle: 0.05,
      fineStretch: 68,
      fissureStrength: 0.52,
      grooveStrength: 0.78,
      coarseBandStrength: 0.02,
      fissureSeeds: 8,
    },
  },
  {
    id: "tuned-04",
    number: 4,
    name: "Sparse deep splits",
    note: "Few wide grooves, low fine contrast",
    grain: {
      seed: 449,
      palette: weathered.umber,
      ridgeCount: 8,
      warpAmount: 0.48,
      warpFrequency: 2.6,
      lightStrength: 0.65,
      speckle: 0.02,
      fineStretch: 62,
      fissureStrength: 0.64,
      grooveStrength: 0.7,
      coarseBandStrength: 0.01,
      fissureSeeds: 2,
    },
  },
  {
    id: "tuned-05",
    number: 5,
    name: "Hairline storm",
    note: "Maximum fine stretch, micro grooves",
    grain: {
      seed: 512,
      palette: weathered.ash,
      ridgeCount: 14,
      warpAmount: 0.62,
      warpFrequency: 4.2,
      lightStrength: 0.7,
      speckle: 0.06,
      fineStretch: 94,
      fissureStrength: 0.38,
      grooveStrength: 0.42,
      coarseBandStrength: 0.03,
      fissureSeeds: 5,
    },
  },
  {
    id: "tuned-06",
    number: 6,
    name: "Dry riverbed",
    note: "Wide horizontal valleys, moderate fibre",
    grain: {
      seed: 628,
      palette: weathered.drift,
      ridgeCount: 7,
      warpAmount: 0.58,
      warpFrequency: 2.4,
      lightStrength: 0.74,
      speckle: 0.03,
      fineStretch: 70,
      fissureStrength: 0.55,
      grooveStrength: 0.85,
      coarseBandStrength: 0.02,
      fissureSeeds: 6,
    },
  },
  {
    id: "tuned-07",
    number: 7,
    name: "Sun-bleached",
    note: "Lighter palette, softer fissures",
    grain: {
      seed: 744,
      palette: { dark: [48, 40, 32], light: [132, 122, 112] },
      ridgeCount: 12,
      warpAmount: 0.5,
      warpFrequency: 3.8,
      lightStrength: 0.58,
      speckle: 0.025,
      fineStretch: 76,
      fissureStrength: 0.35,
      grooveStrength: 0.48,
      coarseBandStrength: 0.04,
      fissureSeeds: 5,
    },
  },
  {
    id: "tuned-08",
    number: 8,
    name: "Char trench",
    note: "Dark palette, deep groove shadow",
    grain: {
      seed: 860,
      palette: weathered.soot,
      ridgeCount: 9,
      warpAmount: 0.76,
      warpFrequency: 3.0,
      lightStrength: 0.88,
      speckle: 0.04,
      fineStretch: 71,
      fissureStrength: 0.68,
      grooveStrength: 0.72,
      coarseBandStrength: 0.02,
      fissureSeeds: 4,
    },
  },
  {
    id: "tuned-09",
    number: 9,
    name: "Chatter cracks",
    note: "Many seed lines, medium fibre",
    grain: {
      seed: 976,
      palette: weathered.umber,
      ridgeCount: 11,
      warpAmount: 0.68,
      warpFrequency: 3.5,
      lightStrength: 0.76,
      speckle: 0.045,
      fineStretch: 73,
      fissureStrength: 0.46,
      grooveStrength: 0.55,
      coarseBandStrength: 0.03,
      fissureSeeds: 9,
    },
  },
  {
    id: "tuned-10",
    number: 10,
    name: "Balanced weathered",
    note: "Default tuning target — fibre + groove + rare seam",
    grain: {
      seed: 1092,
      palette: weathered.charcoal,
      ridgeCount: 10,
      warpAmount: 0.7,
      warpFrequency: 3.2,
      lightStrength: 0.8,
      speckle: 0.04,
      fineStretch: 75,
      fissureStrength: 0.5,
      grooveStrength: 0.58,
      coarseBandStrength: 0.025,
      fissureSeeds: 5,
    },
  },
] as const;

if (tunedWoodVariants.length !== WOOD_TUNED_VARIANT_COUNT) {
  throw new Error(
    `Expected ${WOOD_TUNED_VARIANT_COUNT} tuned wood variants, got ${tunedWoodVariants.length}`,
  );
}
