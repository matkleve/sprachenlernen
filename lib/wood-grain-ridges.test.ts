import { describe, expect, it } from "vitest";

import { renderWoodGrain, ridgePhaseAt, type WoodGrainOptions } from "@/lib/wood-grain-ridges";

function renderToPixels(width: number, height: number, opts: WoodGrainOptions): Uint8ClampedArray {
  let captured: Uint8ClampedArray | null = null;
  const ctx = {
    createImageData: (w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    }),
    putImageData: (imageData: { data: Uint8ClampedArray }) => {
      captured = imageData.data;
    },
  } as unknown as CanvasRenderingContext2D;

  renderWoodGrain(ctx, width, height, opts);
  if (!captured) throw new Error("renderWoodGrain never called putImageData");
  return captured;
}

const options: WoodGrainOptions = {
  seed: 11,
  palette: { dark: [42, 28, 16], light: [96, 70, 42] },
  ridgeCount: 9,
  warpAmount: 0.9,
  warpFrequency: 3.2,
  lightStrength: 0.85,
  speckle: 0,
};

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

describe("ridgePhaseAt", () => {
  const width = 240;
  const height = 200;
  const ctx = {
    width,
    height,
    seed: options.seed,
    ridgeCount: options.ridgeCount,
    warpAmount: options.warpAmount,
    warpFrequency: options.warpFrequency,
  };

  it("varies along x at a fixed y (ridges wave left to right)", () => {
    const y = 80;
    const samples = Array.from({ length: 24 }, (_, i) =>
      ridgePhaseAt(Math.round((i / 24) * width), y, ctx),
    );
    const spread = Math.max(...samples) - Math.min(...samples);
    expect(spread).toBeGreaterThan(0.5);
  });

  it("varies along y at a fixed x (2D warp — not pure x-only stripes)", () => {
    const x = 120;
    const samples = Array.from({ length: 24 }, (_, i) =>
      ridgePhaseAt(x, Math.round((i / 24) * height), ctx),
    );
    const spread = Math.max(...samples) - Math.min(...samples);
    expect(spread).toBeGreaterThan(0.5);
  });

  it("changes when x moves at different y rows (2D islands — phase depends on both axes)", () => {
    const xSpreadAtTop = Math.max(
      ...Array.from({ length: 12 }, (_, i) => ridgePhaseAt(Math.round((i / 12) * width), 40, ctx)),
    ) - Math.min(
      ...Array.from({ length: 12 }, (_, i) => ridgePhaseAt(Math.round((i / 12) * width), 40, ctx)),
    );
    const xSpreadAtBottom = Math.max(
      ...Array.from({ length: 12 }, (_, i) => ridgePhaseAt(Math.round((i / 12) * width), 160, ctx)),
    ) - Math.min(
      ...Array.from({ length: 12 }, (_, i) => ridgePhaseAt(Math.round((i / 12) * width), 160, ctx)),
    );
    expect(xSpreadAtTop).toBeGreaterThan(0.3);
    expect(xSpreadAtBottom).toBeGreaterThan(0.3);
    expect(Math.abs(xSpreadAtTop - xSpreadAtBottom)).toBeGreaterThan(0.05);
  });

});

describe("renderWoodGrain", () => {
  it("renders opaque pixels across the full canvas", () => {
    const width = 100;
    const height = 80;
    const pixels = renderToPixels(width, height, options);
    expect(pixels.length).toBe(width * height * 4);
    for (let i = 3; i < pixels.length; i += 4) {
      expect(pixels[i]).toBe(255);
    }
  });
});
