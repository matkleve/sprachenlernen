/**
 * Canvas procedural wood — rings + domain-warped fibres.
 * Algorithm aligned with Texturize wood generator + STUDY-030 (not feTurbulence).
 */

import { createPermutation, tileableFbm2D } from "@/lib/perlin-noise";

export type Rgb = readonly [number, number, number];

export type ProceduralWoodParams = {
  seed: number;
  size: number;
  /** Light earlywood tone */
  light: Rgb;
  /** Dark latewood tone */
  dark: Rgb;
  /** Stretch along grain axis (horizontal bench = high value) */
  grainStretch: number;
  ringFrequency: number;
  ringContrast: number;
  ringCenterX: number;
  ringCenterY: number;
  grainFrequency: number;
  grainContrast: number;
  warpStrength: number;
  warpFrequency: number;
  /** 0 = rings only, 1 = fibres only */
  grainMix: number;
  /** Overall polish — lowers contrast as it rises (oiled wood) */
  polish: number;
};

export type ProceduralWoodPresetId = "workshop-1-raw" | "workshop-2-sanded" | "workshop-3-oiled";

export const PROCEDURAL_WOOD_PRESETS: Record<ProceduralWoodPresetId, ProceduralWoodParams> = {
  "workshop-1-raw": {
    seed: 41,
    size: 256,
    light: [132, 96, 62],
    dark: [38, 24, 14],
    grainStretch: 8,
    ringFrequency: 9,
    ringContrast: 0.88,
    ringCenterX: 0.5,
    ringCenterY: 0.85,
    grainFrequency: 42,
    grainContrast: 0.62,
    warpStrength: 0.42,
    warpFrequency: 2.8,
    grainMix: 0.35,
    polish: 0.05,
  },
  "workshop-2-sanded": {
    seed: 41,
    size: 256,
    light: [158, 118, 78],
    dark: [52, 36, 22],
    grainStretch: 8.5,
    ringFrequency: 11,
    ringContrast: 0.68,
    ringCenterX: 0.5,
    ringCenterY: 0.82,
    grainFrequency: 48,
    grainContrast: 0.45,
    warpStrength: 0.3,
    warpFrequency: 3.2,
    grainMix: 0.4,
    polish: 0.35,
  },
  "workshop-3-oiled": {
    seed: 41,
    size: 256,
    light: [204, 156, 102],
    dark: [72, 48, 28],
    grainStretch: 9,
    ringFrequency: 13,
    ringContrast: 0.48,
    ringCenterX: 0.48,
    ringCenterY: 0.78,
    grainFrequency: 52,
    grainContrast: 0.32,
    warpStrength: 0.2,
    warpFrequency: 3.6,
    grainMix: 0.45,
    polish: 0.72,
  },
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function mixRgb(a: Rgb, b: Rgb, t: number): [number, number, number] {
  const mix = clamp01(t);
  return [
    Math.round(a[0] + (b[0] - a[0]) * mix),
    Math.round(a[1] + (b[1] - a[1]) * mix),
    Math.round(a[2] + (b[2] - a[2]) * mix),
  ];
}

function sampleWood(perm: Uint8Array, params: ProceduralWoodParams, u: number, v: number): number {
  const px = u * params.grainStretch;
  const py = v;

  const warpX =
    tileableFbm2D(perm, px * params.warpFrequency, py * params.warpFrequency, { octaves: 3 }) *
    params.warpStrength;
  const warpY =
    tileableFbm2D(
      perm,
      px * params.warpFrequency + 4.1,
      py * params.warpFrequency + 1.7,
      { octaves: 3 },
    ) * params.warpStrength;

  const wx = px + warpX;
  const wy = py + warpY;

  // Face-grain plank: growth rings read as horizontal waves, not radial circles.
  const ringPhase =
    wy * params.ringFrequency * Math.PI * 2 +
    tileableFbm2D(perm, wx * 0.8, wy * 0.25, { octaves: 2 }) * 1.4;
  const rings = Math.sin(ringPhase);

  const fibres = tileableFbm2D(perm, wx * params.grainFrequency, wy * (params.grainFrequency * 0.06), {
    octaves: 5,
    gain: 0.55,
  });

  const blended = rings * (1 - params.grainMix) + fibres * params.grainMix;
  const contrast = params.ringContrast * (1 - params.grainMix) + params.grainContrast * params.grainMix;
  const polished = blended * (1 - params.polish * 0.65);
  const shaped = Math.tanh(polished * contrast * 2.4);

  return clamp01(shaped * 0.5 + 0.5);
}

/** Render a seamless wood tile to a data URL (PNG), or null when canvas is unavailable. */
export function renderProceduralWoodDataUrl(params: ProceduralWoodParams): string | null {
  const size = params.size;
  const perm = createPermutation(params.seed);

  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const image = context.createImageData(size, size);
  const { data } = image;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const tone = sampleWood(perm, params, u, v);
      const [r, g, b] = mixRgb(params.dark, params.light, tone);
      const index = (y * size + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

export function proceduralWoodPresetForStage(stage: number): ProceduralWoodPresetId | null {
  if (stage === 1) return "workshop-1-raw";
  if (stage === 2) return "workshop-2-sanded";
  if (stage === 3) return "workshop-3-oiled";
  return null;
}

export function proceduralWoodStyleFromDataUrl(dataUrl: string, tileSize = 256): Record<string, string> {
  return {
    backgroundImage: `url("${dataUrl}")`,
    backgroundSize: `${tileSize}px ${tileSize}px`,
    backgroundRepeat: "repeat",
  };
}
