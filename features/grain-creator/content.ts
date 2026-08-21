import type { GrainPresetId } from "@/lib/grain-creator";

export const page = {
  eyebrow: "Dev",
  title: "Grain creator",
  intro:
    "Tune procedural wood graining — fBm-style macro hills and valleys (like terrain heightmaps) plus anisotropic micro fibre. No stripe gradients.",
  previewHeading: "Generated preview",
  referenceHeading: "Reference — workshop 1",
  generatedHeading: "Generated",
  referenceAlt: "Reference board crop — raw wood planks, workshop stage 1",
  referenceMissing: (path: string) =>
    `Reference crop missing. Add ${path} (workshop 1 background from the design board).`,
  sizingNote:
    "Stretch fills the area with one noise sample — no tile seam. Tile repeats a bitmap (can show a straight cut).",
  viewSplit: "Split",
  viewOverlay: "Overlay",
  viewDiff: "Diff heatmap",
  uploadReference: "Upload reference",
  analyzeReference: "Analyze valleys",
  autoFit: "Auto-fit (trial)",
  scoreLabel: (rmse: string) => `Diff RMSE: ${rmse} (lower = closer)`,
  diffHeading: "Difference heatmap",
  diffAlt: "Pixel difference between reference luminance and generated grain",
  macroHeading: "Macro terrain (valleys)",
  microHeading: "Micro fibre",
  presetsHeading: "Presets",
  copyLabel: "Copy CSS",
  copiedLabel: "Copied",
  resetLabel: "Reset to raw planks",
  tileNote: (macro: number, micro: number) =>
    `Macro tile ${macro}px · micro tile ${micro}px`,
} as const;

export const presetLabels: Record<GrainPresetId, string> = {
  "raw-planks": "Raw planks",
  "sanded-bench": "Sanded bench",
  "oiled-timber": "Oiled timber",
  "stock-bar": "Stock bar",
};

export const controlLabels = {
  baseColor: "Base colour",
  macroFreqX: "Macro freq X (along fibre)",
  macroFreqY: "Macro freq Y (cross grain)",
  macroOctaves: "Macro octaves",
  macroSeed: "Macro seed",
  macroValleySharpness: "Valley abruptness (gamma)",
  macroContrast: "Valley depth (contrast)",
  macroBrightness: "Macro brightness",
  macroLayerOpacity: "Macro layer opacity",
  macroBlendMode: "Macro blend mode",
  macroSizing: "Macro sizing",
  macroTileWidthPx: "Macro tile width (px)",
  macroTileHeightPx: "Macro tile height (px)",
  microFreqX: "Micro freq X",
  microFreqY: "Micro freq Y",
  microOctaves: "Micro octaves",
  microSeed: "Micro seed",
  microValleySharpness: "Micro sharpness (gamma)",
  microContrast: "Micro contrast",
  microBrightness: "Micro brightness",
  microLayerOpacity: "Micro layer opacity",
  microBlendMode: "Micro blend mode",
  microSizing: "Micro sizing",
  microTileWidthPx: "Micro tile width (px)",
  microTileHeightPx: "Micro tile height (px)",
} as const;

export const sizingOptions = [
  { value: "stretch", label: "Stretch (no seam)" },
  { value: "tile", label: "Tile (repeat)" },
] as const;

export const blendModeOptions = [
  { value: "multiply", label: "Multiply" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft light" },
  { value: "normal", label: "Normal" },
] as const;
