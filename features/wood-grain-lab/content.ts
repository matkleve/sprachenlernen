/** Dev-tool copy — English literals, not messages/*.json (owner tooling). */

export const page = {
  eyebrow: "Dev",
  title: "Wood grain lab",
  intro:
    "Tune toward the normative reference board (docs/specs/feature/progression-reference-board.md). Copy JSON when a column reads right; owner marks pass on /dev/progression.",
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
  horizontal: "Matches reference board — fibres run left ↔ right along the plank.",
  vertical: "Does not match the reference board — adjust until column 1–3 read.",
  mixed: "Ambiguous — compare to the reference board column.",
} as const;
