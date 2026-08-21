import { describe, expect, it } from "vitest";

import { tileableFbm2D, createPermutation } from "@/lib/perlin-noise";
import {
  PROCEDURAL_WOOD_PRESETS,
  proceduralWoodPresetForStage,
  renderProceduralWoodDataUrl,
} from "@/lib/procedural-wood";

describe("proceduralWoodPresetForStage", () => {
  it("maps workshop stages 1–3 to wood presets", () => {
    expect(proceduralWoodPresetForStage(1)).toBe("workshop-1-raw");
    expect(proceduralWoodPresetForStage(2)).toBe("workshop-2-sanded");
    expect(proceduralWoodPresetForStage(3)).toBe("workshop-3-oiled");
    expect(proceduralWoodPresetForStage(4)).toBeNull();
  });
});

describe("PROCEDURAL_WOOD_PRESETS refinement", () => {
  it("reduces ring contrast and raises polish from raw to oiled", () => {
    const raw = PROCEDURAL_WOOD_PRESETS["workshop-1-raw"];
    const oiled = PROCEDURAL_WOOD_PRESETS["workshop-3-oiled"];
    expect(raw.ringContrast).toBeGreaterThan(oiled.ringContrast);
    expect(oiled.polish).toBeGreaterThan(raw.polish);
  });
});

describe("tileableFbm2D", () => {
  it("wraps coordinates on the unit torus", () => {
    const perm = createPermutation(7);
    const a = tileableFbm2D(perm, 0.12, 0.25);
    const b = tileableFbm2D(perm, 1.12, 0.25);
    expect(a).toBeCloseTo(b, 5);
  });
});

const hasCanvas2d =
  typeof document !== "undefined" && Boolean(document.createElement("canvas").getContext("2d"));

describe("renderProceduralWoodDataUrl", () => {
  it.skipIf(!hasCanvas2d)("returns a PNG data URL", () => {
    const url = renderProceduralWoodDataUrl(PROCEDURAL_WOOD_PRESETS["workshop-1-raw"]);
    expect(url).not.toBeNull();
    expect(url!.startsWith("data:image/png")).toBe(true);
  });
});
