/**
 * Shared procedural wood presets — single source for wood-texture-lab and
 * calibration targets. Tune here; progression CSS grain follows the same ratios.
 */

import type { WoodGrainOptions } from "@/lib/wood-grain-ridges";
import { DEFAULT_WOOD_VALLEYS, type WoodValleyOptions } from "@/lib/wood-valleys";

export type WoodGrainPreset = {
  id: string;
  number: number;
  name: string;
  marks: readonly string[];
  grain: WoodGrainOptions;
  pill?: boolean;
};

export const page = {
  title: "Wood textures",
  intro:
    "Four procedural wood swatches from the progression reference board. Each stacks horizontal grain at different scales — fine fibres over coarser streaks on a warm colour wash. Grain runs left to right only.",
  grainNote: "Layered horizontal grain with sparse procedural fissures; canvas redraws per size.",
  marksHeading: "Marks",
} as const;
export const RAW_PLANKS_GRAIN: WoodGrainOptions = {
  seed: 11,
  palette: { dark: [62, 42, 24], light: [178, 136, 86] },
  ridgeCount: 8,
  warpAmount: 0.62,
  warpFrequency: 2.5,
  lightStrength: 0.95,
  speckle: 0.06,
  valleys: {
    ...DEFAULT_WOOD_VALLEYS,
    strength: 0.32,
    threshold: 0.3,
    runWidth: 40,
  },
};

export const SANDED_BENCH_GRAIN: WoodGrainOptions = {
  seed: 27,
  palette: { dark: [58, 40, 22], light: [108, 82, 52] },
  ridgeCount: 12,
  warpAmount: 0.58,
  warpFrequency: 4.1,
  lightStrength: 0.52,
  speckle: 0.035,
  valleys: {
    ...DEFAULT_WOOD_VALLEYS,
    strength: 0.5,
    threshold: 0.3,
    runWidth: 40,
  },
};

export const OILED_TIMBER_GRAIN: WoodGrainOptions = {
  seed: 44,
  palette: { dark: [70, 46, 24], light: [132, 96, 56] },
  ridgeCount: 16,
  warpAmount: 0.42,
  warpFrequency: 5,
  lightStrength: 0.38,
  speckle: 0.02,
  valleys: {
    ...DEFAULT_WOOD_VALLEYS,
    strength: 0.38,
    threshold: 0.32,
    runWidth: 32,
  },
};

export const STOCK_BAR_GRAIN: WoodGrainOptions = {
  seed: 63,
  palette: { dark: [88, 60, 34], light: [152, 112, 68] },
  ridgeCount: 20,
  warpAmount: 0.32,
  warpFrequency: 6,
  lightStrength: 0.32,
  speckle: 0.02,
  valleys: {
    ...DEFAULT_WOOD_VALLEYS,
    strength: 0.25,
    threshold: 0.34,
    runWidth: 24,
  },
};

export const woodGrainPresets: readonly WoodGrainPreset[] = [
  {
    id: "raw-planks",
    number: 1,
    name: "Raw planks",
    marks: [
      "Horizontal fibre layers",
      "Sparse procedural fissures",
      "Matte warm brown",
    ],
    grain: RAW_PLANKS_GRAIN,
  },
  {
    id: "sanded-bench",
    number: 2,
    name: "Sanded bench",
    marks: ["Horizontal fibre layers", "Softer fissures", "Medium contrast"],
    grain: SANDED_BENCH_GRAIN,
  },
  {
    id: "oiled-timber",
    number: 3,
    name: "Oiled timber",
    marks: ["Horizontal fibre layers", "Tight fine grain", "Soft sheen"],
    grain: OILED_TIMBER_GRAIN,
  },
  {
    id: "stock-bar",
    number: 4,
    name: "Stock bar",
    marks: ["Horizontal fibre layers", "Fine dense grain", "Rounded profile"],
    grain: STOCK_BAR_GRAIN,
    pill: true,
  },
] as const;

/** SVG feTurbulence baseFrequency X Y — matches warpFrequency anisotropy (~16:1). */
export const PROGRESSION_WOOD_GRAIN_FREQ = "0.38 0.028" as const;

export type { WoodValleyOptions };
