/** Dev-tool copy — English literals, not messages/*.json (owner tooling). */

export const page = {
  eyebrow: "Dev",
  title: "Wood grain lab",
  intro:
    "Tune procedural workshop wood layer by layer. Grain must run horizontally along planks — that means baseFrequency X is much higher than Y. Copy the JSON when a combination reads right; we will promote values into progression skins.",
  previewLabel: "Preview plank",
  directionHeading: "Grain direction",
  layersHeading: "Layers",
  grainHeading: "Grain (feTurbulence)",
  planksHeading: "Planks",
  lightHeading: "Lighting",
  baseHeading: "Base colour",
  presetsHeading: "Presets",
  exportHeading: "Export",
  exportHint: "Paste this back to an agent or into progression.json notes.",
  soloHint: "Solo shows one layer on a flat mid-tone so direction is obvious.",
} as const;

export const layerLabels = {
  base: "Base gradient",
  planks: "Plank bands + seams",
  grain: "Directional grain",
  light: "Vignette + top highlight",
} as const;

export const controlLabels = {
  freqX: "freqX (horizontal detail)",
  freqY: "freqY (vertical detail)",
  numOctaves: "numOctaves",
  seed: "seed",
  svgOpacity: "SVG rect opacity",
  layerOpacity: "Layer opacity",
  tileWidth: "Tile width (px)",
  tileHeight: "Tile height (px)",
  contrast: "filter contrast",
  brightness: "filter brightness",
  blendMode: "blend mode",
  noiseType: "noise type",
  plankWidth: "Plank width (px)",
  seamWidth: "Seam width (px)",
  seamOpacity: "Seam darkness",
  vignetteStrength: "Bottom vignette",
  topHighlight: "Top highlight",
  baseTop: "Base top",
  baseBottom: "Base bottom",
} as const;

export const directionCopy = {
  horizontal: "Horizontal — fibres run left ↔ right along the plank.",
  vertical: "Vertical — wrong for bench wood; raise freqX or lower freqY.",
  mixed: "Mixed — neither axis dominates; grain direction is ambiguous.",
} as const;
