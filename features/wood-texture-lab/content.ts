export type WoodTexture = {
  id: string;
  number: number;
  name: string;
  marks: readonly string[];
  presetId: "workshop-1-raw" | "workshop-2-sanded" | "workshop-3-oiled";
  topHighlight?: number;
  roundedBar?: boolean;
};

export const woodTextures: readonly WoodTexture[] = [
  {
    id: "raw-planks",
    number: 1,
    name: "Raw planks",
    marks: ["Domain-warped rings + fibres", "Dark weathered bench", "Canvas tile (256px)"],
    presetId: "workshop-1-raw",
  },
  {
    id: "sanded-bench",
    number: 2,
    name: "Sanded bench",
    marks: ["Lower ring contrast", "Medium brown tone", "Same geometry, finer read"],
    presetId: "workshop-2-sanded",
  },
  {
    id: "oiled-timber",
    number: 3,
    name: "Oiled timber",
    marks: ["Warm honey wash", "Higher polish knob", "Faint top highlight"],
    presetId: "workshop-3-oiled",
    topHighlight: 0.08,
  },
  {
    id: "stock-bar",
    number: 4,
    name: "Stock bar",
    marks: ["Polished button stock", "Rounded bar profile", "Oiled preset + sheen"],
    presetId: "workshop-3-oiled",
    topHighlight: 0.14,
    roundedBar: true,
  },
] as const;

export const page = {
  title: "Wood textures",
  intro:
    "Four horizontal-grain wood species from the progression reference board. Swatches are canvas-rendered (Texturize-style rings + warp), not CSS line stacks.",
  grainNote:
    "Grain runs left→right. Tiles use domain-warped Perlin + growth rings — the approach documented in STUDY-030 and texturize.app/generators/wood.",
  marksHeading: "Marks",
} as const;
