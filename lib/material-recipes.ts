/**
 * Nine material recipes for `/dev/materials`. Contract:
 * docs/specs/page/material-explorer.md
 *
 * Each stage is a controlled combination of base + texture + edge + lighting —
 * not a separate skin. Numeric knobs mirror the PBR progression in the reference.
 */

export const MIN_MATERIAL_STAGE = 1;
export const MAX_MATERIAL_STAGE = 9;

export type MaterialChapterId = "workshop" | "library" | "observatory";

export type MaterialRecipe = {
  stage: number;
  name: string;
  material: string;
  base: string;
  texture: string;
  edges: string;
  lighting: string;
  /** 0–1 — surface roughness (high = scattered light) */
  roughness: number;
  /** 0–1 — texture overlay opacity */
  grain: number;
  /** px — corner radius for card, input, button */
  radius: number;
  /** 0–1 — specular highlight strength */
  specular: number;
  /** Star count for Observatory environmental light */
  stars: number;
};

export type MaterialChapter = {
  id: MaterialChapterId;
  name: string;
  tagline: string;
  stageFrom: number;
  stageTo: number;
};

export const materialChapters: MaterialChapter[] = [
  {
    id: "workshop",
    name: "Workshop",
    tagline: "Raw wood and stone — tactile, humble",
    stageFrom: 1,
    stageTo: 3,
  },
  {
    id: "library",
    name: "Library",
    tagline: "Plaster and paper — scholarly, refined",
    stageFrom: 4,
    stageTo: 6,
  },
  {
    id: "observatory",
    name: "Observatory",
    tagline: "Marble and brass — celestial, ceremonial",
    stageFrom: 7,
    stageTo: 9,
  },
];

export const materialRecipes: MaterialRecipe[] = [
  {
    stage: 1,
    name: "Raw Workshop",
    material: "Raw wood / stone",
    base: "Dark walnut",
    texture: "Strong wood grain",
    edges: "Sharp, imperfect",
    lighting: "Almost flat",
    roughness: 0.85,
    grain: 1.0,
    radius: 8,
    specular: 0.05,
    stars: 0,
  },
  {
    stage: 2,
    name: "Sanded Workshop",
    material: "Sanded wood / stone",
    base: "Medium walnut",
    texture: "Finer grain",
    edges: "Slightly softened",
    lighting: "Subtle contact shadow",
    roughness: 0.65,
    grain: 0.7,
    radius: 12,
    specular: 0.12,
    stars: 0,
  },
  {
    stage: 3,
    name: "Oiled Workshop",
    material: "Oiled wood",
    base: "Warm honey wood",
    texture: "Rich grain + slight sheen",
    edges: "Rounded / sanded",
    lighting: "Directional warm highlight",
    roughness: 0.45,
    grain: 0.25,
    radius: 16,
    specular: 0.28,
    stars: 0,
  },
  {
    stage: 4,
    name: "Cool Plaster",
    material: "Cool plaster",
    base: "Warm grey / cream",
    texture: "Coarse plaster",
    edges: "Rounded",
    lighting: "Diffuse",
    roughness: 0.55,
    grain: 0.35,
    radius: 14,
    specular: 0.08,
    stars: 0,
  },
  {
    stage: 5,
    name: "Refined Paper",
    material: "Refined plaster / paper",
    base: "Pale stone",
    texture: "Very fine mineral / paper grain",
    edges: "Cleaner",
    lighting: "Soft ambient",
    roughness: 0.4,
    grain: 0.18,
    radius: 18,
    specular: 0.1,
    stars: 0,
  },
  {
    stage: 6,
    name: "Fine Paper",
    material: "Fine paper / stone",
    base: "Ivory-grey",
    texture: "Almost imperceptible grain",
    edges: "Generous radius",
    lighting: "Very soft shadow",
    roughness: 0.28,
    grain: 0.05,
    radius: 20,
    specular: 0.06,
    stars: 0,
  },
  {
    stage: 7,
    name: "Dark Marble",
    material: "Dark marble",
    base: "Blue-black",
    texture: "Marble veins",
    edges: "Rounded",
    lighting: "Faint brass reflection",
    roughness: 0.42,
    grain: 0.22,
    radius: 20,
    specular: 0.18,
    stars: 0,
  },
  {
    stage: 8,
    name: "Marble + Brass",
    material: "Marble + brass",
    base: "Blue-black",
    texture: "Richer marble",
    edges: "Larger radius",
    lighting: "Stars create edge highlights",
    roughness: 0.32,
    grain: 0.28,
    radius: 22,
    specular: 0.32,
    stars: 12,
  },
  {
    stage: 9,
    name: "Observatory Premium",
    material: "Polished marble + brass",
    base: "Deep navy marble",
    texture: "Fine veins + polished surface",
    edges: "Very rounded",
    lighting: "Strongest warm glow + reflections",
    roughness: 0.22,
    grain: 0.2,
    radius: 24,
    specular: 0.48,
    stars: 24,
  },
];

const FIRST_CHAPTER = materialChapters[0]!;
const FIRST_RECIPE = materialRecipes[0]!;

export function clampMaterialStage(stage: number): number {
  if (!Number.isFinite(stage)) return MIN_MATERIAL_STAGE;
  return Math.min(MAX_MATERIAL_STAGE, Math.max(MIN_MATERIAL_STAGE, Math.round(stage)));
}

export function chapterForMaterialStage(stage: number): MaterialChapter {
  const clamped = clampMaterialStage(stage);
  const found = materialChapters.find(
    (chapter) => clamped >= chapter.stageFrom && clamped <= chapter.stageTo,
  );
  return found ?? FIRST_CHAPTER;
}

export function materialRecipeForStage(stage: number): MaterialRecipe {
  const clamped = clampMaterialStage(stage);
  return materialRecipes.find((entry) => entry.stage === clamped) ?? FIRST_RECIPE;
}

export function materialStageClass(stage: number): string {
  return `material-stage-${clampMaterialStage(stage)}`;
}

export function materialStageStyle(stage: number): Record<string, string> {
  const recipe = materialRecipeForStage(stage);
  return {
    "--material-roughness": String(recipe.roughness),
    "--material-grain": String(recipe.grain),
    "--material-radius": `${recipe.radius}px`,
    "--material-specular": String(recipe.specular),
    "--material-stars": String(recipe.stars),
  };
}
