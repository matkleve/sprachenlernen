export type WoodTexture = {
  id: string;
  number: number;
  name: string;
  marks: readonly string[];
  swatchClass: string;
};

export const woodTextures: readonly WoodTexture[] = [
  {
    id: "raw-planks",
    number: 1,
    name: "Raw planks",
    marks: ["Horizontal grain", "Dark weathered bench", "Wide plank seams"],
    swatchClass: "wood-texture-swatch--raw-planks",
  },
  {
    id: "sanded-bench",
    number: 2,
    name: "Sanded bench",
    marks: ["Horizontal grain", "Medium brown tone", "Softer seam lines"],
    swatchClass: "wood-texture-swatch--sanded-bench",
  },
  {
    id: "oiled-timber",
    number: 3,
    name: "Oiled timber",
    marks: ["Horizontal grain", "Warm honey wash", "Tighter fibre read"],
    swatchClass: "wood-texture-swatch--oiled-timber",
  },
  {
    id: "stock-bar",
    number: 4,
    name: "Stock bar",
    marks: ["Horizontal grain", "Polished button stock", "Rounded bar profile"],
    swatchClass: "wood-texture-swatch--stock-bar",
  },
] as const;

export const page = {
  title: "Wood textures",
  intro:
    "Four horizontal-grain wood species from the progression reference board. Use this page to mark which texture belongs on each surface before wiring skins in /dev/progression.",
  grainNote: "All four swatches use horizontal fibres — grain runs left to right.",
  marksHeading: "Marks",
} as const;
