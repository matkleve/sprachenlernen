/** Dev-tool copy — English literals, not messages/*.json (owner tooling). */

export const page = {
  eyebrow: "Dev",
  title: "Wood grain lab",
  intro:
    "Canvas procedural wood (domain-warped rings + fibres). Tune presets toward the reference board; wire winners into /dev/materials and /dev/progression.",
  previewLabel: "Preview plank",
  proceduralNote:
    "Replaces feTurbulence/CSS line stacks. Algorithm follows texturize.app/generators/wood + STUDY-030.",
  paramsHeading: "Active preset knobs",
  presetsHeading: "Workshop presets",
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
