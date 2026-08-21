/**
 * Procedural horizontal wood graining — macro valleys + micro fibre noise.
 * Contract: docs/specs/page/grain-creator.md, STUDY-029.
 *
 * Macro = deep horizontal dark valleys (latewood lines), not vertical plank
 * columns — those read like tiled game-map chunks and are absent from the
 * reference board.
 */

export type GrainBlendMode = "multiply" | "overlay" | "soft-light" | "normal";

export type GrainParams = {
  /** Flat backdrop so grain reads in isolation — not a material lighting stack. */
  baseColor: string;
  /** Deep horizontal valley line — the “separated along the grain” read. */
  valleyDarkOpacity: number;
  valleyWidthPx: number;
  /** Light lift immediately below the valley before ridge colour returns. */
  ridgeLiftPx: number;
  secondaryValleyOpacity: number;
  secondaryValleyWidthPx: number;
  /** Height of each horizontal ridge tone band within one repeat cycle. */
  ridgeBandPx: number;
  ridgeColorA: string;
  ridgeColorB: string;
  ridgeColorC: string;
  ridgeColorD: string;
  /** feTurbulence baseFrequency X — low = wide structure along the fibre. */
  freqX: number;
  /** feTurbulence baseFrequency Y — high = tight sampling → horizontal streaks. */
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
  valleyDarkOpacity: 0.52,
  valleyWidthPx: 2,
  ridgeLiftPx: 3,
  secondaryValleyOpacity: 0.28,
  secondaryValleyWidthPx: 1,
  ridgeBandPx: 6,
  ridgeColorA: "#3f2a18",
  ridgeColorB: "#362415",
  ridgeColorC: "#422c1a",
  ridgeColorD: "#342214",
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
    valleyDarkOpacity: 0.38,
    ridgeLiftPx: 4,
    secondaryValleyOpacity: 0.16,
    ridgeBandPx: 7,
    ridgeColorA: "#523820",
    ridgeColorB: "#4a3220",
    ridgeColorC: "#5a4030",
    ridgeColorD: "#463020",
    blendMode: "overlay",
  },
  "oiled-timber": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#3d2a18",
    valleyDarkOpacity: 0.42,
    valleyWidthPx: 1,
    ridgeLiftPx: 2,
    secondaryValleyOpacity: 0.18,
    ridgeBandPx: 5,
    ridgeColorA: "#6a4a32",
    ridgeColorB: "#5f422c",
    ridgeColorC: "#705038",
    ridgeColorD: "#584028",
    fibreContrast: 1.15,
    blendMode: "soft-light",
  },
  "stock-bar": {
    ...DEFAULT_GRAIN_PARAMS,
    baseColor: "#5c4028",
    valleyDarkOpacity: 0.22,
    valleyWidthPx: 1,
    ridgeLiftPx: 2,
    secondaryValleyOpacity: 0.1,
    secondaryValleyWidthPx: 1,
    ridgeBandPx: 4,
    ridgeColorA: "#7a5638",
    ridgeColorB: "#6e4c30",
    ridgeColorC: "#846040",
    ridgeColorD: "#644830",
    tileWidthPx: 240,
    tileHeightPx: 96,
    blendMode: "overlay",
  },
};

export function grainRepeatHeightPx(params: GrainParams): number {
  return (
    params.valleyWidthPx +
    params.ridgeLiftPx +
    params.secondaryValleyWidthPx +
    params.ridgeBandPx * 4
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

/** Horizontal dark valleys + lighter ridges — 180deg, repeats vertically. */
export function buildMacroGradient(params: GrainParams): string {
  const valleyEnd = params.valleyWidthPx;
  const liftEnd = valleyEnd + params.ridgeLiftPx;
  const secondaryEnd = liftEnd + params.secondaryValleyWidthPx;
  const ridgeAEnd = secondaryEnd + params.ridgeBandPx;
  const ridgeBEnd = ridgeAEnd + params.ridgeBandPx;
  const ridgeCEnd = ridgeBEnd + params.ridgeBandPx;
  const ridgeDEnd = ridgeCEnd + params.ridgeBandPx;

  return [
    "repeating-linear-gradient(180deg,",
    `rgb(0 0 0 / ${params.valleyDarkOpacity}) 0 ${valleyEnd}px,`,
    `transparent ${valleyEnd}px ${liftEnd}px,`,
    `rgb(0 0 0 / ${params.secondaryValleyOpacity}) ${liftEnd}px ${secondaryEnd}px,`,
    `${params.ridgeColorA} ${secondaryEnd}px ${ridgeAEnd}px,`,
    `${params.ridgeColorB} ${ridgeAEnd}px ${ridgeBEnd}px,`,
    `${params.ridgeColorC} ${ridgeBEnd}px ${ridgeCEnd}px,`,
    `${params.ridgeColorD} ${ridgeCEnd}px ${ridgeDEnd}px)`,
  ].join("\n  ");
}

export function buildGrainCssSnippet(params: GrainParams): string {
  const repeatHeight = grainRepeatHeightPx(params);
  const macro = buildMacroGradient(params);
  const fibre = buildFibreSvgUri(params);
  const filter =
    params.fibreContrast !== 1 || params.fibreBrightness !== 1
      ? `\n  filter: contrast(${params.fibreContrast}) brightness(${params.fibreBrightness});`
      : "";

  return [
    "/* Horizontal wood graining — macro valleys + micro fibre */",
    ".grain-preview {",
    `  background-color: ${params.baseColor};`,
    "  background-image:",
    `    /* fibre layer — apply on ::before in production */`,
    `    ${fibre},`,
    `    ${macro};`,
    "  background-size:",
    `    ${params.tileWidthPx}px ${params.tileHeightPx}px,`,
    `    100% ${repeatHeight}px;`,
    `  background-blend-mode: ${params.blendMode}, normal;`,
    "}",
    "",
    "/* Prefer splitting layers so filter applies to fibre only: */",
    ".grain-preview__macro {",
    `  background-color: ${params.baseColor};`,
    `  background-image: ${macro.replace(/\n\s+/g, " ")};`,
    `  background-size: 100% ${repeatHeight}px;`,
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

export function isHorizontalMacroGradient(gradient: string): boolean {
  return gradient.includes("repeating-linear-gradient(180deg");
}
