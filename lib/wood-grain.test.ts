import { describe, expect, it } from "vitest";

import {
  buildWoodGrainDataUri,
  buildWoodSurfaceStyle,
  DEFAULT_WOOD_GRAIN,
  woodGrainDirection,
  WOOD_GRAIN_PRESETS,
} from "@/lib/wood-grain";

describe("woodGrainDirection", () => {
  it("reads horizontal when freqX is much larger than freqY", () => {
    expect(woodGrainDirection({ freqX: 0.45, freqY: 0.02 })).toBe("horizontal");
  });

  it("reads vertical when freqY is much larger than freqX", () => {
    expect(woodGrainDirection({ freqX: 0.02, freqY: 0.45 })).toBe("vertical");
  });
});

describe("buildWoodGrainDataUri", () => {
  it("embeds anisotropic baseFrequency for horizontal fibres", () => {
    const uri = buildWoodGrainDataUri(DEFAULT_WOOD_GRAIN);
    expect(uri).toContain(encodeURIComponent("0.45 0.02"));
    expect(uri).toContain("fractalNoise");
  });
});

describe("buildWoodSurfaceStyle", () => {
  it("builds plank bands without embedding grain in the stack", () => {
    const style = buildWoodSurfaceStyle({
      ...WOOD_GRAIN_PRESETS["workshop-1-raw"].surface,
      layers: { base: true, planks: true, grain: true, light: false },
    });

    expect(String(style.backgroundImage ?? "")).not.toContain("feTurbulence");
    expect(String(style.backgroundImage ?? "")).toContain("repeating-linear-gradient");
  });
});
