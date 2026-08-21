/**
 * Browser canvas rendering + auto-fit for grain analysis.
 * Contract: docs/specs/page/grain-creator.md
 */

import {
  buildMacroNoiseUri,
  buildMicroNoiseUri,
  buildNoiseLayerFilter,
  type GrainBlendMode,
  type GrainParams,
} from "./grain-creator";

import {
  computeMatchScore,
  GRAIN_ANALYSIS_SIZE,
  type GrainMatchScore,
} from "./grain-analysis";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function canvasBlendMode(mode: GrainBlendMode): GlobalCompositeOperation {
  switch (mode) {
    case "multiply":
      return "multiply";
    case "overlay":
      return "overlay";
    case "soft-light":
      return "soft-light";
    default:
      return "source-over";
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load grain noise image"));
    image.src = src;
  });
}

export async function loadReferenceImageData(
  src: string,
  size = GRAIN_ANALYSIS_SIZE,
): Promise<ImageData> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(image, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

async function drawNoiseLayer(
  ctx: CanvasRenderingContext2D,
  uri: string,
  params: {
    sizing: GrainParams["macroSizing"];
    tileWidthPx: number;
    tileHeightPx: number;
    opacity: number;
    blendMode: GrainBlendMode;
    filter: string;
  },
  width: number,
  height: number,
): Promise<void> {
  const image = await loadImage(uri);
  const [sizeX, sizeY] =
    params.sizing === "stretch" ? [width, height] : [params.tileWidthPx, params.tileHeightPx];

  ctx.save();
  ctx.globalAlpha = params.opacity;
  ctx.globalCompositeOperation = canvasBlendMode(params.blendMode);
  ctx.filter = params.filter;
  ctx.drawImage(image, 0, 0, sizeX, sizeY);
  ctx.restore();
}

export async function renderGrainImageData(
  params: GrainParams,
  size = GRAIN_ANALYSIS_SIZE,
): Promise<ImageData> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = params.baseColor;
  ctx.fillRect(0, 0, size, size);

  await drawNoiseLayer(
    ctx,
    buildMacroNoiseUri(params),
    {
      sizing: params.macroSizing,
      tileWidthPx: params.macroTileWidthPx,
      tileHeightPx: params.macroTileHeightPx,
      opacity: params.macroLayerOpacity,
      blendMode: params.macroBlendMode,
      filter: buildNoiseLayerFilter(params.macroContrast, params.macroBrightness),
    },
    size,
    size,
  );

  await drawNoiseLayer(
    ctx,
    buildMicroNoiseUri(params),
    {
      sizing: params.microSizing,
      tileWidthPx: params.microTileWidthPx,
      tileHeightPx: params.microTileHeightPx,
      opacity: params.microLayerOpacity,
      blendMode: params.microBlendMode,
      filter: buildNoiseLayerFilter(params.microContrast, params.microBrightness),
    },
    size,
    size,
  );

  return ctx.getImageData(0, 0, size, size);
}

const TUNABLE_KEYS: (keyof GrainParams)[] = [
  "macroFreqX",
  "macroFreqY",
  "macroContrast",
  "macroValleySharpness",
  "macroBrightness",
  "macroLayerOpacity",
  "microContrast",
  "microLayerOpacity",
  "microFreqY",
  "macroSeed",
];

function perturbParams(params: GrainParams, magnitude: number): GrainParams {
  const next = { ...params };
  const pick = TUNABLE_KEYS[Math.floor(Math.random() * TUNABLE_KEYS.length)];

  switch (pick) {
    case "macroFreqX":
      next.macroFreqX = clamp(next.macroFreqX * (1 + (Math.random() - 0.5) * magnitude), 0.001, 0.02);
      break;
    case "macroFreqY":
      next.macroFreqY = clamp(next.macroFreqY * (1 + (Math.random() - 0.5) * magnitude), 0.008, 0.08);
      break;
    case "macroContrast":
      next.macroContrast = clamp(next.macroContrast + (Math.random() - 0.5) * magnitude, 1.2, 4);
      break;
    case "macroValleySharpness":
      next.macroValleySharpness = clamp(
        next.macroValleySharpness + (Math.random() - 0.5) * magnitude,
        1.2,
        5,
      );
      break;
    case "macroBrightness":
      next.macroBrightness = clamp(next.macroBrightness + (Math.random() - 0.5) * magnitude * 0.2, 0.5, 1.2);
      break;
    case "macroLayerOpacity":
      next.macroLayerOpacity = clamp(next.macroLayerOpacity + (Math.random() - 0.5) * magnitude * 0.2, 0.4, 1);
      break;
    case "microContrast":
      next.microContrast = clamp(next.microContrast + (Math.random() - 0.5) * magnitude, 0.8, 2.5);
      break;
    case "microLayerOpacity":
      next.microLayerOpacity = clamp(next.microLayerOpacity + (Math.random() - 0.5) * magnitude * 0.2, 0.2, 0.9);
      break;
    case "microFreqY":
      next.microFreqY = clamp(next.microFreqY * (1 + (Math.random() - 0.5) * magnitude), 0.2, 0.7);
      break;
    case "macroSeed":
      next.macroSeed = clamp(Math.round(next.macroSeed + (Math.random() - 0.5) * 20), 1, 99);
      break;
    default:
      break;
  }

  return next;
}

export type GrainRefineResult = {
  params: GrainParams;
  score: GrainMatchScore;
  iterations: number;
};

export async function refineParamsTowardReference(
  reference: ImageData,
  start: GrainParams,
  iterations = 48,
): Promise<GrainRefineResult> {
  let bestParams: GrainParams = { ...start, macroSizing: "stretch", microSizing: "stretch" };
  let bestScore = computeMatchScore(reference, await renderGrainImageData(bestParams, reference.width));

  for (let i = 0; i < iterations; i++) {
    const magnitude = i < iterations / 2 ? 0.35 : 0.15;
    const candidate = perturbParams(bestParams, magnitude);
    const score = computeMatchScore(reference, await renderGrainImageData(candidate, reference.width));
    if (score.mse < bestScore.mse) {
      bestParams = candidate;
      bestScore = score;
    }
  }

  return { params: bestParams, score: bestScore, iterations };
}
