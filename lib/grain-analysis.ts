/**
 * Reference-vs-generated grain analysis — luminance valleys, diff score, param hints.
 * Contract: docs/specs/page/grain-creator.md
 *
 * Not true Fourier synthesis — we extract spatial frequency from row luminance
 * (autocorrelation ≈ power spectrum peaks) and tune noise params toward the
 * reference by minimizing pixel MSE.
 */

import type { GrainParams } from "./grain-creator";

export {
  loadReferenceImageData,
  refineParamsTowardReference,
  renderGrainImageData,
  type GrainRefineResult,
} from "./grain-analysis-render";

export const GRAIN_ANALYSIS_SIZE = 256;

export type GrainAnalysisMetrics = {
  valleyDepth: number;
  luminanceSpread: number;
  rowPeriodPx: number;
  edgeSharpness: number;
  meanLuminance: number;
};

export type GrainAnalysisSuggestion = {
  metrics: GrainAnalysisMetrics;
  suggested: Partial<GrainParams>;
};

export type GrainMatchScore = {
  mse: number;
  rmse: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function luminancePlane(image: ImageData): Float32Array {
  const out = new Float32Array(image.width * image.height);
  for (let i = 0; i < out.length; i++) {
    const offset = i * 4;
    const r = image.data[offset] ?? 0;
    const g = image.data[offset + 1] ?? 0;
    const b = image.data[offset + 2] ?? 0;
    out[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  return out;
}

export function rowLuminanceProfile(luminance: Float32Array, width: number, height: number): Float32Array {
  const profile = new Float32Array(height);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) {
      sum += luminance[y * width + x] ?? 0;
    }
    profile[y] = sum / width;
  }
  return profile;
}

export function dominantPeriodPx(profile: Float32Array, minLag = 4): number {
  if (profile.length < minLag * 2) return profile.length / 4;

  const scores: number[] = [];
  for (let lag = minLag; lag < profile.length / 2; lag++) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < profile.length - lag; i++) {
      sum += (profile[i] ?? 0) * (profile[i + lag] ?? 0);
      count++;
    }
    scores[lag] = count > 0 ? sum / count : 0;
  }

  let maxScore = -Infinity;
  for (let lag = minLag; lag < scores.length; lag++) {
    maxScore = Math.max(maxScore, scores[lag] ?? -Infinity);
  }

  for (let lag = minLag; lag < scores.length; lag++) {
    if ((scores[lag] ?? 0) >= maxScore * 0.9) return lag;
  }

  return minLag;
}

function percentile(values: Float32Array, p: number): number {
  const sorted = Array.from(values).sort((a, b) => a - b);
  const index = clamp(Math.floor(p * (sorted.length - 1)), 0, sorted.length - 1);
  return sorted[index] ?? 0;
}

function profileEdgeSharpness(profile: Float32Array): number {
  let sum = 0;
  for (let i = 1; i < profile.length; i++) {
    sum += Math.abs((profile[i] ?? 0) - (profile[i - 1] ?? 0));
  }
  return profile.length > 1 ? sum / (profile.length - 1) : 0;
}

export function analyzeReferenceImage(image: ImageData): GrainAnalysisSuggestion {
  const lum = luminancePlane(image);
  const profile = rowLuminanceProfile(lum, image.width, image.height);
  const p10 = percentile(lum, 0.1);
  const p50 = percentile(lum, 0.5);
  const p90 = percentile(lum, 0.9);
  const spread = p90 - p10;
  const valleyDepth = p50 > 0 ? spread / p50 : spread;
  const rowPeriodPx = dominantPeriodPx(profile);
  const edgeSharpness = profileEdgeSharpness(profile);
  const meanLuminance = percentile(lum, 0.5);

  const metrics: GrainAnalysisMetrics = {
    valleyDepth,
    luminanceSpread: spread,
    rowPeriodPx,
    edgeSharpness,
    meanLuminance,
  };

  const macroFreqY = clamp(0.85 / rowPeriodPx, 0.008, 0.06);
  const macroFreqX = macroFreqY * 0.14;
  const macroContrast = clamp(1.2 + valleyDepth * 2.2, 1.4, 3.8);
  const macroValleySharpness = clamp(1.4 + edgeSharpness * 18, 1.5, 4.5);
  const macroBrightness = clamp(0.95 - valleyDepth * 0.35, 0.55, 1.05);
  const microContrast = clamp(1 + edgeSharpness * 6, 1, 2.2);

  return {
    metrics,
    suggested: {
      baseColor: rgbToHex(meanLuminance * 0.55, meanLuminance * 0.38, meanLuminance * 0.24),
      macroFreqX,
      macroFreqY,
      macroContrast,
      macroValleySharpness,
      macroBrightness,
      macroSizing: "stretch",
      microFreqX: macroFreqX * 4.5,
      microFreqY: clamp(macroFreqY * 16, 0.25, 0.65),
      microContrast,
      microSizing: "stretch",
    },
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toByte = (channel: number) =>
    clamp(Math.round(channel * 255), 0, 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

export function computeMatchScore(reference: ImageData, generated: ImageData): GrainMatchScore {
  const refLum = luminancePlane(reference);
  const genLum = luminancePlane(generated);
  const count = Math.min(refLum.length, genLum.length);
  let mse = 0;
  for (let i = 0; i < count; i++) {
    const delta = (refLum[i] ?? 0) - (genLum[i] ?? 0);
    mse += delta * delta;
  }
  mse /= count || 1;
  return { mse, rmse: Math.sqrt(mse) * 255 };
}

export function buildDiffHeatmapImage(reference: ImageData, generated: ImageData): ImageData {
  const refLum = luminancePlane(reference);
  const genLum = luminancePlane(generated);
  const out = new ImageData(reference.width, reference.height);

  for (let i = 0; i < refLum.length; i++) {
    const delta = Math.abs((refLum[i] ?? 0) - (genLum[i] ?? 0));
    const heat = clamp(Math.round(delta * 640), 0, 255);
    const offset = i * 4;
    out.data[offset] = heat;
    out.data[offset + 1] = Math.round(heat * 0.25);
    out.data[offset + 2] = Math.round(heat * 0.1);
    out.data[offset + 3] = 255;
  }

  return out;
}

export function mergeParams(base: GrainParams, patch: Partial<GrainParams>): GrainParams {
  return { ...base, ...patch };
}

export function periodPxToMacroFreqY(periodPx: number): number {
  return clamp(0.85 / periodPx, 0.008, 0.06);
}
