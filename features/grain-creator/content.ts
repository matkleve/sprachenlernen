import type { GrainPresetId } from "@/lib/grain-creator";

export const page = {
  eyebrow: "Dev",
  title: "Grain creator",
  intro:
    "Tune horizontal wood graining only — deep macro valleys along the fibre and micro noise on top. No vertical banding. Copy the CSS snippet into wood-textures or progression skins when a recipe reads right.",
  previewHeading: "Preview",
  macroHeading: "Macro valleys",
  fibreHeading: "Micro fibres",
  presetsHeading: "Presets",
  copyLabel: "Copy CSS",
  copiedLabel: "Copied",
  resetLabel: "Reset to raw planks",
  repeatNote: (height: number) => `Valley repeat cycle: ${height}px`,
} as const;

export const presetLabels: Record<GrainPresetId, string> = {
  "raw-planks": "Raw planks",
  "sanded-bench": "Sanded bench",
  "oiled-timber": "Oiled timber",
  "stock-bar": "Stock bar",
};

export const controlLabels = {
  baseColor: "Base colour",
  valleyDarkOpacity: "Valley depth (opacity)",
  valleyWidthPx: "Valley width (px)",
  ridgeLiftPx: "Ridge lift (px)",
  secondaryValleyOpacity: "Secondary valley opacity",
  secondaryValleyWidthPx: "Secondary valley width (px)",
  ridgeBandPx: "Ridge band height (px)",
  ridgeColorA: "Ridge A",
  ridgeColorB: "Ridge B",
  ridgeColorC: "Ridge C",
  ridgeColorD: "Ridge D",
  freqX: "Frequency X (wide)",
  freqY: "Frequency Y (streaks)",
  octaves: "Octaves",
  tileWidthPx: "Tile width (px)",
  tileHeightPx: "Tile height (px)",
  fibreSvgOpacity: "Noise density (SVG)",
  fibreLayerOpacity: "Fibre layer opacity",
  fibreContrast: "Fibre contrast",
  fibreBrightness: "Fibre brightness",
  blendMode: "Blend mode",
} as const;

export const blendModeOptions = [
  { value: "multiply", label: "Multiply" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft light" },
  { value: "normal", label: "Normal" },
] as const;
