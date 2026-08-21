/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";

import {
  analyzeReferenceImage,
  computeMatchScore,
  dominantPeriodPx,
  luminancePlane,
  periodPxToMacroFreqY,
  rowLuminanceProfile,
} from "./grain-analysis";

function makeStripedReference(period: number, width = 64, height = 64): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const valley = Math.sin((y / period) * Math.PI * 2) < 0;
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const value = valley ? 40 : 180;
      data[offset] = value;
      data[offset + 1] = Math.round(value * 0.7);
      data[offset + 2] = Math.round(value * 0.45);
      data[offset + 3] = 255;
    }
  }
  return { data, width, height } as ImageData;
}

describe("grain-analysis", () => {
  it("detects dominant row period from dark/light horizontal bands", () => {
    const image = makeStripedReference(12);
    const profile = rowLuminanceProfile(luminancePlane(image), image.width, image.height);
    const period = dominantPeriodPx(profile);
    expect(period).toBeGreaterThanOrEqual(10);
    expect(period).toBeLessThanOrEqual(14);
  });

  it("suggests higher macro contrast when reference valleys are deep", () => {
    const deep = makeStripedReference(10);
    const shallow = makeStripedReference(10);
    for (let i = 0; i < shallow.data.length; i += 4) {
      if ((shallow.data[i] ?? 0) < 128) {
        shallow.data[i] = 90;
        shallow.data[i + 1] = 70;
        shallow.data[i + 2] = 50;
      }
    }

    const deepSuggestion = analyzeReferenceImage(deep);
    const shallowSuggestion = analyzeReferenceImage(shallow);
    expect(deepSuggestion.suggested.macroContrast ?? 0).toBeGreaterThan(
      shallowSuggestion.suggested.macroContrast ?? 0,
    );
  });

  it("scores identical luminance as zero MSE", () => {
    const image = makeStripedReference(8);
    expect(computeMatchScore(image, image).mse).toBe(0);
  });

  it("maps row period to macro frequency", () => {
    expect(periodPxToMacroFreqY(20)).toBeCloseTo(0.0425, 3);
  });
});
