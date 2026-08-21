import { describe, expect, it } from "vitest";

import { renderWoodGrain, ridgeFieldAt, type WoodGrainOptions } from "@/lib/wood-grain-ridges";

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

describe("ridgeFieldAt (layered horizontal grain field)", () => {
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

  it("varies along x at fixed y (coarse irregularity across the plank)", () => {
    const y = 80;
    const samples = Array.from({ length: 24 }, (_, i) =>
      ridgeFieldAt(Math.round((i / 24) * width), y, ctx),
    );
    expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(0.15);
  });

  it("varies along y at fixed x (ridge spacing bends vertically)", () => {
    const x = 120;
    const samples = Array.from({ length: 24 }, (_, i) =>
      ridgeFieldAt(x, Math.round((i / 24) * height), ctx),
    );
    expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(0.15);
  });

  it("is not separable into y-only stripes (different rows have different x profiles)", () => {
    const spread = (rowY: number) => {
      const samples = Array.from({ length: 16 }, (_, i) =>
        ridgeFieldAt(Math.round((i / 16) * width), rowY, ctx),
      );
      return Math.max(...samples) - Math.min(...samples);
    };
    expect(Math.abs(spread(40) - spread(160))).toBeGreaterThan(0.05);
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
