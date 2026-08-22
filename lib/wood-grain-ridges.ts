/**
 * Procedural wood grain for `/dev/wood-textures` — longitudinal plank fibres.
 *
 * Visual model (spec: wood-texture-lab.md, study: STUDY-030):
 * - Y-periodic coarse bands + X-warp only (no radial / growth-ring field)
 * - Anisotropic fine striations along the plank
 * - Sparse horizontal fissures (algorithmic defect layer)
 * - palette + raking light — species tone and matte/oiled read
 */

export type WoodGrainPalette = {
  /** Valley colour (low ridge) */
  dark: readonly [number, number, number];
  /** Hill colour (high ridge) */
  light: readonly [number, number, number];
};

export type WoodGrainOptions = {
  seed: number;
  palette: WoodGrainPalette;
  /** How many coarse horizontal bands fit down the texture height */
  ridgeCount: number;
  /** Irregularity strength within each grain scale */
  warpAmount: number;
  /** Horizontal feature scale for the irregularity field */
  warpFrequency: number;
  /** 0–1 — how much ridge slope drives light/dark beyond the base mix */
  lightStrength: number;
  /** 0–1 — fine per-pixel speckle so it does not look too clean */
  speckle: number;
  /** 0–1 — sparse dark horizontal fissures (weathered plank) */
  fissureStrength?: number;
  /** Anisotropic stretch for hairline striations along the plank */
  fineStretch?: number;
};

function hash2(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Bilinear value noise on an integer lattice — smooth, cheap, no allocations. */
function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(x - x0);
  const ty = smoothstep(y - y0);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  const ab = a + (b - a) * tx;
  const cd = c + (d - c) * tx;
  return ab + (cd - ab) * ty;
}

/** Multiband fbm for 2D irregularity within each grain scale. */
function multibandFbm(x: number, y: number, seed: number, bands = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;
  for (let i = 0; i < bands; i++) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 31.7) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.02;
  }
  return value / maxValue;
}

function mixChannel(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Caps warp so ridges do not fold into tight zigzags at small widths. */
export function stableWarpAmount(
  warpAmount: number,
  width: number,
  warpFrequency: number,
): number {
  const maxWarp = width / (200 * warpFrequency * 1.05);
  return Math.min(warpAmount, maxWarp);
}

/** Board-space coords for the irregularity field — anisotropic (high X, low Y). */
function distortionCoords(
  x: number,
  y: number,
  width: number,
  height: number,
  ridgeCount: number,
  warpFrequency: number,
): { nx: number; ny: number; u: number; v: number } {
  return {
    u: x / width,
    v: y / height,
    nx: (x / width) * warpFrequency * 2.6,
    ny: (y / height) * ridgeCount * 0.38,
  };
}

/**
 * Localized bumps in the ridge field — optional irregularity so ridges are not
 * perfectly parallel stripes.
 */
function influenceDisplacement(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  strength: number,
): number {
  let displacement = 0;
  const count = 4;
  for (let i = 0; i < count; i++) {
    const h = i * 3.17;
    const ix = hash2(h, 0, seed) * width;
    const iy = hash2(h, 1, seed) * height;
    const power = hash2(h, 2, seed) * 0.45 + 0.25;
    const radius = 0.1 + hash2(h, 3, seed) * 0.14;
    const dx = (x - ix) / width;
    const dy = (y - iy) / height;
    const dist2 = dx * dx + dy * dy;
    const falloff = Math.exp(-dist2 / (radius * radius));
    displacement += power * dy * falloff * strength;
  }
  return displacement;
}

export type RidgeFieldContext = {
  width: number;
  height: number;
  seed: number;
  ridgeCount: number;
  warpAmount: number;
  warpFrequency: number;
};

/**
 * Height field for horizontal grain contours on a longitudinal plank.
 * Base spacing from Y only, curved by X-warp — never radial / growth-ring arcs.
 */
export function ridgeFieldAt(x: number, y: number, ctx: RidgeFieldContext): number {
  const { width, height, seed, ridgeCount, warpAmount, warpFrequency } = ctx;
  const { nx, ny, u, v } = distortionCoords(x, y, width, height, ridgeCount, warpFrequency);
  const warp = stableWarpAmount(warpAmount, width, warpFrequency);

  const warpX = (multibandFbm(nx, ny, seed) - 0.5) * warp * 0.42;
  const warpMicro = (multibandFbm(nx + 2.7, ny + 1.3, seed + 47) - 0.5) * warp * 0.15;
  const bandWobble = (multibandFbm(nx * 0.85, ny * 0.32, seed + 8) - 0.5) * warp * 0.2;
  const influence = influenceDisplacement(x, y, width, height, seed + 113, warp * 0.38);

  const baseY = v + warpX + warpMicro + bandWobble;
  return baseY * ridgeCount + influence * ridgeCount * 0.35;
}

/** Hairline striations along the plank (high X stretch, low Y). */
function fineStriations(u: number, v: number, seed: number, fineStretch: number): number {
  return multibandFbm(u * fineStretch, v * (fineStretch * 0.035), seed + 91, 4) - 0.5;
}

/** Sparse defect peaks from elongated noise — horizontal-biased statistics. */
function sparseDefectNoise(u: number, v: number, seed: number): number {
  const n1 = multibandFbm(u * 5.2, v * 0.65, seed + 200, 3);
  const n2 = multibandFbm(u * 2.4, v * 0.28, seed + 220, 2);
  const combined = n1 * 0.72 + n2 * 0.28;
  const thresh = 0.68;
  return Math.max(0, combined - thresh) / (1 - thresh);
}

/** Occasional long horizontal fissures (weathered seam lines). */
function horizontalFissureSeeds(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): number {
  let peak = 0;
  const count = 5;
  for (let i = 0; i < count; i++) {
    const h = i * 5.31 + seed * 0.017;
    const cy = hash2(h, 0, seed + 301) * height;
    const cx = hash2(h, 1, seed + 301) * width;
    const halfLen = width * (0.42 + hash2(h, 2, seed + 301) * 0.48) * 0.5;
    const halfThick = height * (0.0015 + hash2(h, 3, seed + 301) * 0.005);
    const dx = (x - cx) / halfLen;
    const dy = (y - cy) / halfThick;
    const dist2 = dx * dx + dy * dy;
    const depth = hash2(h, 4, seed + 301) * 0.35 + 0.65;
    peak = Math.max(peak, depth * Math.exp(-dist2 * 1.15));
  }
  return peak;
}

function slowToneWash(u: number, v: number, seed: number): number {
  return multibandFbm(u * 1.4, v * 0.18, seed + 5, 2) - 0.5;
}

function fissureAt(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): number {
  const u = x / width;
  const v = y / height;
  const sparse = sparseDefectNoise(u, v, seed);
  const seams = horizontalFissureSeeds(x, y, width, height, seed);
  return Math.max(seams, sparse * 0.35);
}

/** Smoothed band signal from ridge field height. */
function ridgeSignal(height: number): number {
  return Math.sin(height * Math.PI * 2);
}

/** Paints procedural wood grain into `ctx` at `width` × `height` pixels. */
export function renderWoodGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: WoodGrainOptions,
): void {
  if (width <= 0 || height <= 0) return;

  const image = ctx.createImageData(width, height);
  const data = image.data;
  const {
    seed,
    palette,
    ridgeCount,
    warpAmount,
    warpFrequency,
    lightStrength,
    speckle,
    fissureStrength = 0.52,
    fineStretch = 68,
  } = opts;
  const sampleCtx: RidgeFieldContext = {
    width,
    height,
    seed,
    ridgeCount,
    warpAmount,
    warpFrequency,
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const field = ridgeFieldAt(x, y, sampleCtx);
      const fieldRight = ridgeFieldAt(x + 1, y, sampleCtx);

      const u = x / width;
      const v = y / height;
      const fine = fineStriations(u, v, seed, fineStretch);
      const fineRight = fineStriations((x + 1) / width, v, seed, fineStretch);
      const fineDown = fineStriations(u, (y + 1) / height, seed, fineStretch);
      const slow = slowToneWash(u, v, seed);
      const ridge = ridgeSignal(field);
      const fissure = fissureAt(x, y, width, height, seed);

      const height01 =
        0.52 + fine * 0.13 + slow * 0.035 + ridge * 0.07 + ridgeSignal(fieldRight) * 0.02;
      const speck = (hash2(x * 0.9, y * 0.9, seed + 41) - 0.5) * speckle;
      const slopeX = fineRight - fine;
      const slopeY = fineDown - fine;
      const light =
        Math.max(-1, Math.min(1, slopeX * 0.55 + slopeY * 0.25 + (ridgeSignal(fieldRight) - ridge) * 0.2)) *
        lightStrength *
        2.2;
      const t = clamp01(height01 + light * 0.45 + speck - fissure * fissureStrength);

      const idx = (y * width + x) * 4;
      data[idx] = mixChannel(palette.dark[0], palette.light[0], t);
      data[idx + 1] = mixChannel(palette.dark[1], palette.light[1], t);
      data[idx + 2] = mixChannel(palette.dark[2], palette.light[2], t);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}
