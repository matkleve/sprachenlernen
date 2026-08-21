/**
 * Dev-tool copy. Contract: docs/specs/page/material-explorer.md
 */

export const page = {
  eyebrow: "Dev",
  title: "Material explorer",
  intro:
    "Nine levels of material sophistication — not nine skins. The same card, input, and button geometry; only the material stack changes: base fill, texture, edge, highlight, contact shadow, and environmental light. Workshop 1→2→3 should feel like the same bench getting better.",
  stageLabel: "Stage",
  chapterHeading: "Chapter",
  recipeHeading: "Material recipe",
  recipeColumns: {
    property: "Property",
    value: "Value",
  },
  recipeRows: {
    material: "Material",
    base: "Base",
    texture: "Texture",
    edges: "Edges",
    lighting: "Lighting",
    roughness: "Roughness",
    grain: "Grain",
    radius: "Radius",
    specular: "Specular",
  },
  stackHeading: "Material stack",
  stackLayers: [
    "Base fill",
    "Texture",
    "Edge / border",
    "Highlight",
    "Contact shadow",
    "Environmental light",
  ],
  workshopHeading: "Workshop progression",
  workshopIntro:
    "Same geometry — only the material layer switches. If these three feel like one object becoming better-made, the system works.",
  preview: {
    cardTitle: "Narrow listening",
    cardBody: "Three short episodes on one topic. The vocabulary repeats itself.",
    inputPlaceholder: "Paste your own text…",
    buttonLabel: "Start",
  },
} as const;
