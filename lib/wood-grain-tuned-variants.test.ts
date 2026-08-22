import { describe, expect, it } from "vitest";

import { WOOD_TUNED_VARIANT_COUNT } from "@/lib/wood-grain-ridges";
import { tunedWoodVariants } from "@/lib/wood-grain-tuned-variants";

describe("tunedWoodVariants", () => {
  it("always exposes exactly ten tuned presets", () => {
    expect(tunedWoodVariants.length).toBe(WOOD_TUNED_VARIANT_COUNT);
    expect(tunedWoodVariants.length).toBe(10);
  });

  it("uses distinct seeds across variants", () => {
    const seeds = tunedWoodVariants.map((v) => v.grain.seed);
    expect(new Set(seeds).size).toBe(seeds.length);
  });
});
