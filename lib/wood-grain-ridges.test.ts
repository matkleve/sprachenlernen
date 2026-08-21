import { describe, expect, it } from "vitest";

import { renderWoodGrain, stableWarpAmount, warpOffsetPx, type WoodGrainOptions } from "@/lib/wood-grain-ridges";

/**
 * Minimal fake 2D context — just enough of `createImageData` /
 * `putImageData` for `renderWoodGrain` to paint into, without a real
 * canvas (unavailable under jsdom).
 */
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

describe("warpOffsetPx", () => {
  const width = 240;
  const height = 200;
  const ridgeStep = height / options.ridgeCount;
  const xSamples = Array.from({ length: 24 }, (_, i) => Math.round((i / 24) * width));

  it("barely changes, on average, within one ridge's own height (a ridge does not fold on itself)", () => {
    const withinRidgeDiffs = xSamples.map((x) => {
      const top = warpOffsetPx(x, 0, width, ridgeStep, options.seed, options.warpAmount, options.warpFrequency);
      const bottom = warpOffsetPx(
        x,
        ridgeStep,
        width,
        ridgeStep,
        options.seed,
        options.warpAmount,
        options.warpFrequency,
      );
      return Math.abs(top - bottom);
    });

    // Regression for the bug where the warp field's y-input varied fast
    // enough within one ridge span that the same ridge sampled a
    // meaningfully different warp near its own top vs its own bottom,
    // reading as an interruption instead of one flowing curve. See
    // STUDY-030 § interrupted ridges.
    expect(mean(withinRidgeDiffs)).toBeLessThan(ridgeStep * 0.1);
  });

  it("drifts noticeably more across several ridges than within one (lets ridges merge or split — organic, not rigid)", () => {
    const withinRidgeDiffs = xSamples.map((x) => {
      const top = warpOffsetPx(x, 0, width, ridgeStep, options.seed, options.warpAmount, options.warpFrequency);
      const bottom = warpOffsetPx(
        x,
        ridgeStep,
        width,
        ridgeStep,
        options.seed,
        options.warpAmount,
        options.warpFrequency,
      );
      return Math.abs(top - bottom);
    });
    const acrossRidgesDiffs = xSamples.map((x) => {
      const top = warpOffsetPx(x, 0, width, ridgeStep, options.seed, options.warpAmount, options.warpFrequency);
      const far = warpOffsetPx(
        x,
        ridgeStep * 6,
        width,
        ridgeStep,
        options.seed,
        options.warpAmount,
        options.warpFrequency,
      );
      return Math.abs(far - top);
    });

    expect(mean(acrossRidgesDiffs)).toBeGreaterThan(mean(withinRidgeDiffs) * 2);
  });

  it("flows smoothly along x for a fixed ridge (no per-column jumps)", () => {
    const y = ridgeStep * 3;
    let maxStep = 0;
    let previous = warpOffsetPx(0, y, width, ridgeStep, options.seed, options.warpAmount, options.warpFrequency);
    for (let x = 1; x < width; x++) {
      const current = warpOffsetPx(x, y, width, ridgeStep, options.seed, options.warpAmount, options.warpFrequency);
      maxStep = Math.max(maxStep, Math.abs(current - previous));
      previous = current;
    }
    expect(maxStep).toBeLessThan(ridgeStep * 0.05);
  });
});

describe("stableWarpAmount", () => {
  it("leaves warpAmount untouched on a wide canvas, where it cannot fold", () => {
    const width = 946;
    const ridgeStep = 192 / 9;
    expect(stableWarpAmount(width, ridgeStep, 3.2, 0.9)).toBeCloseTo(0.9, 5);
  });

  it("shrinks warpAmount on a narrow canvas, where the raw value would fold the ridge", () => {
    const width = 180;
    const ridgeStep = 192 / 9;
    const capped = stableWarpAmount(width, ridgeStep, 3.2, 0.9);
    expect(capped).toBeLessThan(0.9);
    expect(capped).toBeGreaterThan(0);
  });

  it("caps every shipped wood-texture preset so its traced ridge never doubles back on itself", () => {
    // Regression for the "Raw planks" preset (warpAmount 0.9 × warpFrequency
    // 3.2 — the highest product of the four presets), which is the one the
    // owner was looking at when flagging interrupted ridges. See
    // features/wood-texture-lab/content.ts and STUDY-030 § interrupted ridges.
    const presets = [
      { ridgeCount: 9, warpAmount: 0.9, warpFrequency: 3.2 },
      { ridgeCount: 12, warpAmount: 0.6, warpFrequency: 4.1 },
      { ridgeCount: 16, warpAmount: 0.45, warpFrequency: 5 },
      { ridgeCount: 20, warpAmount: 0.35, warpFrequency: 6 },
    ];
    const narrowestExpectedCard = 160;
    const cardHeight = 192;

    for (const preset of presets) {
      const ridgeStep = cardHeight / preset.ridgeCount;
      const safe = stableWarpAmount(narrowestExpectedCard, ridgeStep, preset.warpFrequency, preset.warpAmount);
      const wavelength = narrowestExpectedCard / preset.warpFrequency;
      const maxSwing = 2 * safe * ridgeStep;
      expect(maxSwing).toBeLessThan(wavelength);
    }
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
