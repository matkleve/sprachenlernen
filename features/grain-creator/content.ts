import type { GrainPresetId } from "@/lib/grain-creator";

export const page = {
  eyebrow: "Dev",
  title: "Grain creator",
  intro:
    "Tune procedural wood graining — fBm-style macro hills and valleys (like terrain heightmaps) plus anisotropic micro fibre. No stripe gradients.",
  previewHeading: "Preview",
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
  macroContrast: "Valley depth (contrast)",
  macroBrightness: "Macro brightness",
  macroLayerOpacity: "Macro layer opacity",
  macroBlendMode: "Macro blend mode",
  macroTileWidthPx: "Macro tile width (px)",
  macroTileHeightPx: "Macro tile height (px)",
  microFreqX: "Micro freq X",
  microFreqY: "Micro freq Y",
  microOctaves: "Micro octaves",
  microSeed: "Micro seed",
  microContrast: "Micro contrast",
  microBrightness: "Micro brightness",
  microLayerOpacity: "Micro layer opacity",
  microBlendMode: "Micro blend mode",
  microTileWidthPx: "Micro tile width (px)",
  microTileHeightPx: "Micro tile height (px)",
} as const;

export const blendModeOptions = [
  { value: "multiply", label: "Multiply" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft light" },
  { value: "normal", label: "Normal" },
] as const;
