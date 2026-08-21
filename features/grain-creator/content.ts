import type { GrainPresetId } from "@/lib/grain-creator";

export const page = {
  eyebrow: "Dev",
  title: "Grain creator",
  intro:
    "Tune horizontal wood graining only — macro band seams and micro fibre noise. Copy the CSS snippet into wood-textures or progression skins when a recipe reads right.",
  previewHeading: "Preview",
  macroHeading: "Macro bands",
  fibreHeading: "Micro fibres",
  presetsHeading: "Presets",
  copyLabel: "Copy CSS",
  copiedLabel: "Copied",
  resetLabel: "Reset to raw planks",
  repeatNote: (width: number) => `Repeat cycle: ${width}px`,
} as const;

export const presetLabels: Record<GrainPresetId, string> = {
  "raw-planks": "Raw planks",
  "sanded-bench": "Sanded bench",
  "oiled-timber": "Oiled timber",
  "stock-bar": "Stock bar",
};

export const controlLabels = {
  baseColor: "Base colour",
  seamDarkOpacity: "Deep seam opacity",
  seamWidthPx: "Seam width (px)",
  gapWidthPx: "Gap before bands (px)",
  secondarySeamOpacity: "Secondary seam opacity",
  secondarySeamWidthPx: "Secondary seam width (px)",
  plankWidthPx: "Plank band width (px)",
  bandColorA: "Band A",
  bandColorB: "Band B",
  bandColorC: "Band C",
  bandColorD: "Band D",
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
