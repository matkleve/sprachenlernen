/**
 * Procedural horizontal wood graining — fBm-style noise hills/valleys + micro fibre.
 * Contract: docs/specs/page/grain-creator.md, STUDY-029.
 *
 * CSS cannot sample noise per-pixel like a game shader — we render one SVG noise
 * field and either stretch it to the area (no repeat seam) or tile it (seams
 * possible). Default: stretch. Valley abruptness uses feComponentTransfer gamma
 * (terrain power-curve trick), not linear contrast alone.
 */

export type GrainBlendMode = "multiply" | "overlay" | "soft-light" | "normal";

export type GrainSizingMode = "stretch" | "tile";

export type GrainParams = {
  baseColor: string;
  macroFreqX: number;
  macroFreqY: number;
  macroOctaves: number;
  macroSeed: number;
  /** Gamma on macro noise — higher = sharper valley walls (reference raw planks). */
  macroValleySharpness: number;
  macroContrast: number;
  macroBrightness: number;
  macroLayerOpacity: number;
  macroBlendMode: GrainBlendMode;
  macroSizing: GrainSizingMode;
  macroTileWidthPx: number;
  macroTileHeightPx: number;
  microFreqX: number;
  microFreqY: number;
  microOctaves: number;
  microSeed: number;
  microValleySharpness: number;
  microContrast: number;
  microBrightness: number;
  microLayerOpacity: number;
  microBlendMode: GrainBlendMode;
  microSizing: GrainSizingMode;
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

/** Workshop 1 raw-planks stand-in — inline so img + canvas always load (no 404). */
const GRAIN_REFERENCE_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>" +
  "<rect width='512' height='512' fill='%232a1c10'/>" +
  "<rect width='512' height='36' y='0' fill='%231a1208' opacity='0.85'/>" +
  "<rect width='512' height='28' y='44' fill='%233f2a18' opacity='0.75'/>" +
  "<rect width='512' height='32' y='88' fill='%231f150c' opacity='0.9'/>" +
  "<rect width='512' height='24' y='132' fill='%234a3220' opacity='0.7'/>" +
  "<rect width='512' height='40' y='168' fill='%23181008' opacity='0.88'/>" +
  "<rect width='512' height='30' y='220' fill='%23362415' opacity='0.78'/>" +
  "<rect width='512' height='36' y='262' fill='%231a1208' opacity='0.86'/>" +
  "<rect width='512' height='28' y='310' fill='%23422c1a' opacity='0.72'/>" +
  "<rect width='512' height='34' y='352' fill='%2315100a' opacity='0.9'/>" +
  "<rect width='512' height='26' y='398' fill='%233d2918' opacity='0.76'/>" +
  "<rect width='512' height='38' y='438' fill='%23120c06' opacity='0.88'/>" +
  "<rect width='512' height='36' y='476' fill='%23342214' opacity='0.74'/>" +
  "</svg>";

export const GRAIN_REFERENCE_IMAGE = `data:image/svg+xml,${encodeURIComponent(GRAIN_REFERENCE_SVG)}`;
/** Static file copy for docs; the page uses {@link GRAIN_REFERENCE_IMAGE} data URI. */
export const GRAIN_REFERENCE_FILE = "/design/grain-creator/workshop-1-raw-planks.svg";

export const DEFAULT_GRAIN_PARAMS: GrainParams = {
  baseColor: "#2a1c10",
  macroFreqX: 0.0035,
  macroFreqY: 0.024,
  macroOctaves: 4,
  macroSeed: 4,
  macroValleySharpness: 3.2,
  macroContrast: 2.85,
  macroBrightness: 0.76,
  macroLayerOpacity: 0.94,
  macroBlendMode: "multiply",
  macroSizing: "stretch",
  macroTileWidthPx: 512,
  macroTileHeightPx: 512,
  microFreqX: 0.016,
  microFreqY: 0.46,
  microOctaves: 4,
  microSeed: 11,
  microValleySharpness: 1.6,
  microContrast: 1.45,
  microBrightness: 1,
  microLayerOpacity: 0.5,
  microBlendMode: "overlay",
  microSizing: "stretch",
  microTileWidthPx: 512,
  microTileHeightPx: 256,
};

export const GRAIN_PRESETS: Record<GrainPresetId, GrainParams> = {
  "raw-planks": { ...DEFAULT_GRAIN_PARAMS },
  "sanded-bench": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#342618",
    macroValleySharpness: 2.1,
    macroContrast: 2,
    macroOctaves: 3,
    macroLayerOpacity: 0.78,
    microLayerOpacity: 0.42,
    microContrast: 1.1,
  },
  "oiled-timber": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#3d2a18",
    macroFreqX: 0.004,
    macroFreqY: 0.028,
    macroValleySharpness: 2.8,
    macroContrast: 3.1,
    macroBrightness: 0.72,
    macroSeed: 7,
    microContrast: 1.55,
    microBlendMode: "soft-light",
    microLayerOpacity: 0.58,
  },
  "stock-bar": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#5c4028",
    macroValleySharpness: 1.8,
    macroContrast: 1.6,
    macroOctaves: 2,
    macroLayerOpacity: 0.58,
    microFreqX: 0.02,
    microFreqY: 0.5,
    microLayerOpacity: 0.38,
  },
};

type BuildNoiseSvgUriInput = {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  valleySharpness: number;
  svgOpacity?: number;
};

/** feTurbulence fractalNoise ≈ fBm heightmap; gamma ≈ terrain power curve. */
export function buildNoiseSvgUri(input: BuildNoiseSvgUriInput): string {
  const opacity = input.svgOpacity ?? 0.9;
  const exponent = input.valleySharpness.toFixed(2);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>` +
    `<filter id='n' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${input.freqX} ${input.freqY}' numOctaves='${input.octaves}' seed='${input.seed}' stitchTiles='stitch' result='noise'/>` +
    `<feColorMatrix type='saturate' values='0' in='noise' result='gray'/>` +
    `<feComponentTransfer in='gray' result='shaped'>` +
    `<feFuncR type='gamma' amplitude='1' exponent='${exponent}' offset='0'/>` +
    `<feFuncG type='gamma' amplitude='1' exponent='${exponent}' offset='0'/>` +
    `<feFuncB type='gamma' amplitude='1' exponent='${exponent}' offset='0'/>` +
    `</feComponentTransfer>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(#n)' opacity='${opacity}'/>` +
    `</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function buildMacroNoiseUri(
  params: Pick<
    GrainParams,
    "macroFreqX" | "macroFreqY" | "macroOctaves" | "macroSeed" | "macroValleySharpness"
  >,
): string {
  return buildNoiseSvgUri({
    freqX: params.macroFreqX,
    freqY: params.macroFreqY,
    octaves: params.macroOctaves,
    seed: params.macroSeed,
    valleySharpness: params.macroValleySharpness,
  });
}

export function buildMicroNoiseUri(
  params: Pick<
    GrainParams,
    "microFreqX" | "microFreqY" | "microOctaves" | "microSeed" | "microValleySharpness"
  >,
): string {
  return buildNoiseSvgUri({
    freqX: params.microFreqX,
    freqY: params.microFreqY,
    octaves: params.microOctaves,
    seed: params.microSeed,
    valleySharpness: params.microValleySharpness,
    svgOpacity: 0.75,
  });
}

/** Strip `url("…")` wrapper so canvas Image.src gets a bare data URI. */
export function noiseUriToImageSrc(cssUrl: string): string {
  const match = cssUrl.match(/^url\(["']?(.+?)["']?\)$/);
  return match?.[1] ?? cssUrl;
}

export function buildNoiseLayerFilter(contrast: number, brightness: number): string {
  return `contrast(${contrast}) brightness(${brightness})`;
}

export function buildNoiseBackgroundSize(
  sizing: GrainSizingMode,
  tileWidthPx: number,
  tileHeightPx: number,
): string {
  return sizing === "stretch" ? "100% 100%" : `${tileWidthPx}px ${tileHeightPx}px`;
}

export function buildNoiseBackgroundRepeat(sizing: GrainSizingMode): "no-repeat" | "repeat" {
  return sizing === "stretch" ? "no-repeat" : "repeat";
}

export function buildGrainCssSnippet(params: GrainParams): string {
  const macro = buildMacroNoiseUri(params);
  const micro = buildMicroNoiseUri(params);
  const macroFilter = buildNoiseLayerFilter(params.macroContrast, params.macroBrightness);
  const microFilter = buildNoiseLayerFilter(params.microContrast, params.microBrightness);
  const macroSize = buildNoiseBackgroundSize(
    params.macroSizing,
    params.macroTileWidthPx,
    params.macroTileHeightPx,
  );
  const microSize = buildNoiseBackgroundSize(
    params.microSizing,
    params.microTileWidthPx,
    params.microTileHeightPx,
  );

  return [
    "/* Wood graining — fBm macro valleys + micro fibre */",
    "/* stretch = one noise field scaled to area (no tile seam); tile = repeating bitmap */",
    ".grain-preview {",
    `  background-color: ${params.baseColor};`,
    "}",
    ".grain-preview__macro {",
    `  background-image: ${macro};`,
    `  background-size: ${macroSize};`,
    `  background-repeat: ${buildNoiseBackgroundRepeat(params.macroSizing)};`,
    `  opacity: ${params.macroLayerOpacity};`,
    `  mix-blend-mode: ${params.macroBlendMode};`,
    `  filter: ${macroFilter};`,
    "}",
    ".grain-preview__micro {",
    `  background-image: ${micro};`,
    `  background-size: ${microSize};`,
    `  background-repeat: ${buildNoiseBackgroundRepeat(params.microSizing)};`,
    `  opacity: ${params.microLayerOpacity};`,
    `  mix-blend-mode: ${params.microBlendMode};`,
    `  filter: ${microFilter};`,
    "}",
  ].join("\n");
}

export function isAnisotropicAlongFibre(freqX: number, freqY: number): boolean {
  return freqY > freqX;
}

export function usesProceduralNoiseOnly(snippet: string): boolean {
  return snippet.includes("feTurbulence") && !snippet.includes("repeating-linear-gradient");
}

export function usesStretchSizing(params: GrainParams): boolean {
  return params.macroSizing === "stretch" && params.microSizing === "stretch";
}
