/**
 * Procedural horizontal wood graining — fBm-style noise hills/valleys + micro fibre.
 * Contract: docs/specs/page/grain-creator.md, STUDY-029.
 *
 * No repeating-linear-gradient stripes. Macro = low-frequency fractal noise
 * (terrain heightmap); valleys are dark lows, ridges are light highs after
 * contrast + multiply — same model as game heightmaps (Red Blob Games / fBm).
 */

export type GrainBlendMode = "multiply" | "overlay" | "soft-light" | "normal";

export type GrainParams = {
  baseColor: string;
  /** Macro terrain — low frequency, few octaves = rolling hills and valleys. */
  macroFreqX: number;
  macroFreqY: number;
  macroOctaves: number;
  macroSeed: number;
  macroContrast: number;
  macroBrightness: number;
  macroLayerOpacity: number;
  macroBlendMode: GrainBlendMode;
  macroTileWidthPx: number;
  macroTileHeightPx: number;
  /** Micro fibre — higher frequency, more octaves = surface detail on the heightmap. */
  microFreqX: number;
  microFreqY: number;
  microOctaves: number;
  microSeed: number;
  microContrast: number;
  microBrightness: number;
  microLayerOpacity: number;
  microBlendMode: GrainBlendMode;
  microTileWidthPx: number;
  microTileHeightPx: number;
};

export type GrainPresetId = "raw-planks" | "sanded-bench" | "oiled-timber" | "stock-bar";

export const GRAIN_PRESET_IDS: readonly GrainPresetId[] = [
  "raw-planks",
  "sanded-bench",
  "oiled-timber",
  "stock-bar",
] as const;

export const DEFAULT_GRAIN_PARAMS: GrainParams = {
  baseColor: "#2a1c10",
  macroFreqX: 0.004,
  macroFreqY: 0.028,
  macroOctaves: 3,
  macroSeed: 4,
  macroContrast: 2.4,
  macroBrightness: 0.82,
  macroLayerOpacity: 0.92,
  macroBlendMode: "multiply",
  macroTileWidthPx: 512,
  macroTileHeightPx: 512,
  microFreqX: 0.018,
  microFreqY: 0.48,
  microOctaves: 4,
  microSeed: 11,
  microContrast: 1.35,
  microBrightness: 1,
  microLayerOpacity: 0.55,
  microBlendMode: "overlay",
  microTileWidthPx: 280,
  microTileHeightPx: 140,
};

export const GRAIN_PRESETS: Record<GrainPresetId, GrainParams> = {
  "raw-planks": { ...DEFAULT_GRAIN_PARAMS },
  "sanded-bench": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#342618",
    macroContrast: 1.75,
    macroOctaves: 2,
    macroLayerOpacity: 0.75,
    microLayerOpacity: 0.45,
    microContrast: 1.15,
  },
  "oiled-timber": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#3d2a18",
    macroFreqX: 0.005,
    macroFreqY: 0.032,
    macroContrast: 2.8,
    macroBrightness: 0.78,
    macroSeed: 7,
    microContrast: 1.5,
    microBlendMode: "soft-light",
    microLayerOpacity: 0.65,
  },
  "stock-bar": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#5c4028",
    macroContrast: 1.35,
    macroOctaves: 2,
    macroLayerOpacity: 0.55,
    microFreqX: 0.022,
    microFreqY: 0.52,
    microLayerOpacity: 0.4,
    microTileWidthPx: 240,
    microTileHeightPx: 96,
  },
};

export type NoiseLayerParams = Pick<
  GrainParams,
  | "macroFreqX"
  | "macroFreqY"
  | "macroOctaves"
  | "macroSeed"
  | "microFreqX"
  | "microFreqY"
  | "microOctaves"
  | "microSeed"
>;

type BuildNoiseSvgUriInput = {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  svgOpacity?: number;
};

/** feTurbulence fractalNoise ≈ fBm heightmap sample (Perlin-style coherent noise). */
export function buildNoiseSvgUri(input: BuildNoiseSvgUriInput): string {
  const opacity = input.svgOpacity ?? 0.85;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'>` +
    `<filter id='n' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${input.freqX} ${input.freqY}' numOctaves='${input.octaves}' seed='${input.seed}' stitchTiles='stitch' result='noise'/>` +
    `<feColorMatrix type='saturate' values='0' in='noise'/>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(#n)' opacity='${opacity}'/>` +
    `</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function buildMacroNoiseUri(
  params: Pick<GrainParams, "macroFreqX" | "macroFreqY" | "macroOctaves" | "macroSeed">,
): string {
  return buildNoiseSvgUri({
    freqX: params.macroFreqX,
    freqY: params.macroFreqY,
    octaves: params.macroOctaves,
    seed: params.macroSeed,
  });
}

export function buildMicroNoiseUri(
  params: Pick<GrainParams, "microFreqX" | "microFreqY" | "microOctaves" | "microSeed">,
): string {
  return buildNoiseSvgUri({
    freqX: params.microFreqX,
    freqY: params.microFreqY,
    octaves: params.microOctaves,
    seed: params.microSeed,
  });
}

export function buildNoiseLayerFilter(contrast: number, brightness: number): string {
  return `contrast(${contrast}) brightness(${brightness})`;
}

export function buildGrainCssSnippet(params: GrainParams): string {
  const macro = buildMacroNoiseUri(params);
  const micro = buildMicroNoiseUri(params);
  const macroFilter = buildNoiseLayerFilter(params.macroContrast, params.macroBrightness);
  const microFilter = buildNoiseLayerFilter(params.microContrast, params.microBrightness);

  return [
    "/* Wood graining — fBm macro valleys + micro fibre (no stripe gradients) */",
    ".grain-preview {",
    `  background-color: ${params.baseColor};`,
    "}",
    ".grain-preview__macro {",
    `  background-image: ${macro};`,
    `  background-size: ${params.macroTileWidthPx}px ${params.macroTileHeightPx}px;`,
    `  opacity: ${params.macroLayerOpacity};`,
    `  mix-blend-mode: ${params.macroBlendMode};`,
    `  filter: ${macroFilter};`,
    "}",
    ".grain-preview__micro {",
    `  background-image: ${micro};`,
    `  background-size: ${params.microTileWidthPx}px ${params.microTileHeightPx}px;`,
    `  opacity: ${params.microLayerOpacity};`,
    `  mix-blend-mode: ${params.microBlendMode};`,
    `  filter: ${microFilter};`,
    "}",
  ].join("\n");
}

/** Anisotropic macro noise — elongated along the fibre (Y > X in frequency). */
export function isAnisotropicAlongFibre(freqX: number, freqY: number): boolean {
  return freqY > freqX;
}

export function usesProceduralNoiseOnly(snippet: string): boolean {
  return snippet.includes("feTurbulence") && !snippet.includes("repeating-linear-gradient");
}
