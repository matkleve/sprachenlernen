/**
 * Dev-tool copy. Contract: docs/specs/page/material-explorer.md
 */

export const page = {
  eyebrow: "Dev",
  title: "Material explorer",
  intro:
    "Nine levels of material sophistication — not nine skins. Workshop stages 1–3 use canvas-rendered wood (domain-warped rings + fibres, Texturize-style) instead of feTurbulence. The same card, input, and button geometry; only the material stack changes.",
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
  progression: {
    insightHeading: "Rough → fine: what actually changes",
    insightBody:
      "Refinement is not “more texture.” Stage 1 shows strong grain and deep inset shadows; stage 3 keeps the same wood species but turns grain down, adds a warm highlight, and softens corners — like sanding and oiling the same bench.",
    grainHintRough: "Full overlay — reads gritty",
    grainHintFine: "Barely visible — reads smooth",
    specularHintFine: "Oiled sheen from top highlight",
    knobSummary:
      "Within a chapter, only numeric knobs move: grain ↓, roughness ↓, specular ↑, radius ↑. Chapter boundaries (3→4, 6→7) swap the material family entirely.",
  },
  preview: {
    cardTitle: "Narrow listening",
    cardBody: "Three short episodes on one topic. The vocabulary repeats itself.",
    inputPlaceholder: "Paste your own text…",
    buttonLabel: "Start",
  },
} as const;
