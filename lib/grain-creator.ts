/**
 * Procedural horizontal wood graining — macro bands + micro fibre noise.
 * Contract: docs/specs/page/grain-creator.md, STUDY-029.
 */

export type GrainBlendMode = "multiply" | "overlay" | "soft-light" | "normal";

export type GrainParams = {
  /** Flat backdrop so grain reads in isolation — not a material lighting stack. */
  baseColor: string;
  /** Deep latewood line at each plank start. */
  seamDarkOpacity: number;
  seamWidthPx: number;
  /** Transparent gap between primary seam and band colours. */
  gapWidthPx: number;
  secondarySeamOpacity: number;
  secondarySeamWidthPx: number;
  plankWidthPx: number;
  bandColorA: string;
  bandColorB: string;
  bandColorC: string;
  bandColorD: string;
  /** feTurbulence baseFrequency X — low = wide horizontal structure. */
  freqX: number;
  /** feTurbulence baseFrequency Y — high = tight vertical sampling → horizontal streaks. */
  freqY: number;
  octaves: number;
  tileWidthPx: number;
  tileHeightPx: number;
  /** Opacity inside the SVG rect (noise density). */
  fibreSvgOpacity: number;
  /** Layer opacity on the preview fibre div. */
  fibreLayerOpacity: number;
  fibreContrast: number;
  fibreBrightness: number;
  blendMode: GrainBlendMode;
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
  seamDarkOpacity: 0.45,
  seamWidthPx: 2,
  gapWidthPx: 76,
  secondarySeamOpacity: 0.28,
  secondarySeamWidthPx: 2,
  plankWidthPx: 78,
  bandColorA: "#3f2a18",
  bandColorB: "#362415",
  bandColorC: "#422c1a",
  bandColorD: "#342214",
  freqX: 0.02,
  freqY: 0.45,
  octaves: 4,
  tileWidthPx: 280,
  tileHeightPx: 140,
  fibreSvgOpacity: 0.65,
  fibreLayerOpacity: 1,
  fibreContrast: 1,
  fibreBrightness: 1,
  blendMode: "overlay",
};

export const GRAIN_PRESETS: Record<GrainPresetId, GrainParams> = {
  "raw-planks": { ...DEFAULT_GRAIN_PARAMS },
  "sanded-bench": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#342618",
    seamDarkOpacity: 0.32,
    gapWidthPx: 80,
    secondarySeamOpacity: 0.18,
    plankWidthPx: 82,
    bandColorA: "#523820",
    bandColorB: "#4a3220",
    bandColorC: "#5a4030",
    bandColorD: "#463020",
    blendMode: "overlay",
  },
  "oiled-timber": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#3d2a18",
    seamDarkOpacity: 0.22,
    gapWidthPx: 84,
    secondarySeamOpacity: 0.12,
    plankWidthPx: 86,
    bandColorA: "#6a4a32",
    bandColorB: "#5f422c",
    bandColorC: "#705038",
    bandColorD: "#584028",
    blendMode: "soft-light",
  },
  "stock-bar": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#5c4028",
    seamDarkOpacity: 0.14,
    seamWidthPx: 1,
    gapWidthPx: 47,
    secondarySeamOpacity: 0.08,
    secondarySeamWidthPx: 1,
    plankWidthPx: 47,
    bandColorA: "#7a5638",
    bandColorB: "#6e4c30",
    bandColorC: "#846040",
    bandColorD: "#644830",
    tileWidthPx: 240,
    tileHeightPx: 96,
    blendMode: "overlay",
  },
};

export function grainRepeatWidthPx(params: GrainParams): number {
  return (
    params.seamWidthPx +
    params.gapWidthPx +
    params.secondarySeamWidthPx +
    params.plankWidthPx * 4
  );
}

export function buildFibreSvgUri(
  params: Pick<GrainParams, "freqX" | "freqY" | "octaves" | "fibreSvgOpacity">,
): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'>` +
    `<filter id='g'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${params.freqX} ${params.freqY}' numOctaves='${params.octaves}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='saturate' values='0'/>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(#g)' opacity='${params.fibreSvgOpacity}'/>` +
    `</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function buildMacroGradient(params: GrainParams): string {
  const seamEnd = params.seamWidthPx;
  const gapEnd = seamEnd + params.gapWidthPx;
  const secondaryEnd = gapEnd + params.secondarySeamWidthPx;
  const bandAEnd = secondaryEnd + params.plankWidthPx;
  const bandBEnd = bandAEnd + params.plankWidthPx;
  const bandCEnd = bandBEnd + params.plankWidthPx;
  const bandDEnd = bandCEnd + params.plankWidthPx;

  return [
    "repeating-linear-gradient(90deg,",
    `rgb(0 0 0 / ${params.seamDarkOpacity}) 0 ${seamEnd}px,`,
    `transparent ${seamEnd}px ${gapEnd}px,`,
    `rgb(0 0 0 / ${params.secondarySeamOpacity}) ${gapEnd}px ${secondaryEnd}px,`,
    `${params.bandColorA} ${secondaryEnd}px ${bandAEnd}px,`,
    `${params.bandColorB} ${bandAEnd}px ${bandBEnd}px,`,
    `${params.bandColorC} ${bandBEnd}px ${bandCEnd}px,`,
    `${params.bandColorD} ${bandCEnd}px ${bandDEnd}px)`,
  ].join("\n  ");
}

export function buildGrainCssSnippet(params: GrainParams): string {
  const repeatWidth = grainRepeatWidthPx(params);
  const macro = buildMacroGradient(params);
  const fibre = buildFibreSvgUri(params);
  const filter =
    params.fibreContrast !== 1 || params.fibreBrightness !== 1
      ? `\n  filter: contrast(${params.fibreContrast}) brightness(${params.fibreBrightness});`
      : "";

  return [
    "/* Horizontal wood graining — macro bands + micro fibre */",
    ".grain-preview {",
    `  background-color: ${params.baseColor};`,
    "  background-image:",
    `    /* fibre layer — apply on ::before in production */`,
    `    ${fibre},`,
    `    ${macro};`,
    "  background-size:",
    `    ${params.tileWidthPx}px ${params.tileHeightPx}px,`,
    `    ${repeatWidth}px 100%;`,
    `  background-blend-mode: ${params.blendMode}, normal;`,
    "}",
    "",
    "/* Prefer splitting layers so filter applies to fibre only: */",
    ".grain-preview__macro {",
    `  background-color: ${params.baseColor};`,
    `  background-image: ${macro.replace(/\n\s+/g, " ")};`,
    `  background-size: ${repeatWidth}px 100%;`,
    "}",
    ".grain-preview__fibre {",
    `  background-image: ${fibre};`,
    `  background-size: ${params.tileWidthPx}px ${params.tileHeightPx}px;`,
    `  opacity: ${params.fibreLayerOpacity};`,
    `  mix-blend-mode: ${params.blendMode};${filter}`,
    "}",
  ].join("\n");
}

export function isHorizontalFibre(params: Pick<GrainParams, "freqX" | "freqY">): boolean {
  return params.freqY > params.freqX;
}
