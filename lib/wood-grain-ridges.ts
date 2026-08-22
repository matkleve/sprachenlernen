/**
 * Procedural wood grain for `/dev/wood-textures` — longitudinal plank fibres.
 *
 * Visual model (spec: wood-texture-lab.md, study: STUDY-030 / STUDY-033):
 * - Anisotropic fine striations (primary tone)
 * - Morphological horizontal grooves (blur-difference valleys)
 * - Irregular sparse fissures (elongated seeds + defect noise)
 * - Optional weak Y-band warp — never radial growth rings
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
  /** 0–1 — dark horizontal fissures and grooves */
  fissureStrength?: number;
  /** Anisotropic stretch for hairline striations along the plank */
  fineStretch?: number;
  /** 0–1 — morphological horizontal groove layer (blur-difference valleys) */
  grooveStrength?: number;
  /** 0–1 — weak sin-band accent from warp field (0 = fibre-only) */
  coarseBandStrength?: number;
  /** Max irregular horizontal seam seeds (actual count derived from seed) */
  fissureSeeds?: number;
};

/** Always show ten tuned algorithmic variants on the wood texture lab. */
export const WOOD_TUNED_VARIANT_COUNT = 10;

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
 * Warp field for optional weak band accent — Y spacing + X warp, never radial rings.
 */
export function ridgeFieldAt(x: number, y: number, ctx: RidgeFieldContext): number {
  const { width, height, seed, ridgeCount, warpAmount, warpFrequency } = ctx;
  const { nx, ny, v } = distortionCoords(x, y, width, height, ridgeCount, warpFrequency);
  const warp = stableWarpAmount(warpAmount, width, warpFrequency);

  const warpX = (multibandFbm(nx, ny, seed) - 0.5) * warp * 0.42;
  const warpMicro = (multibandFbm(nx + 2.7, ny + 1.3, seed + 47) - 0.5) * warp * 0.15;
  const bandWobble = (multibandFbm(nx * 0.85, ny * 0.32, seed + 8) - 0.5) * warp * 0.2;
  const influence = influenceDisplacement(x, y, width, height, seed + 113, warp * 0.38);

  const baseY = v + warpX + warpMicro + bandWobble;
  return baseY * ridgeCount + influence * ridgeCount * 0.35;
}

function ridgeSignal(height: number): number {
  return Math.sin(height * Math.PI * 2);
}

function fineStriations(u: number, v: number, seed: number, fineStretch: number): number {
  const fine1 = multibandFbm(u * (fineStretch * 0.038), v * fineStretch, seed + 91, 5);
  const fine2 = multibandFbm(u * (fineStretch * 0.026), v * (fineStretch * 1.28), seed + 102, 3);
  return (fine1 * 0.72 + fine2 * 0.28) - 0.5;
}

function slowToneWash(u: number, v: number, seed: number): number {
  return multibandFbm(u * 1.4, v * 0.16, seed + 5, 2) - 0.5;
}

/** Coarse relief for morphological groove extraction. */
function coarseRelief(u: number, v: number, seed: number): number {
  return multibandFbm(u * 0.34, v * 3.6, seed + 400, 4);
}

function horizontalBlurRelief(u: number, v: number, seed: number, step: number): number {
  let sum = 0;
  for (let i = -3; i <= 3; i++) {
    sum += coarseRelief(u + i * step, v, seed);
  }
  return sum / 7;
}

/**
 * Horizontal blur-difference valleys (STUDY-033 morphological proxy, per-pixel).
 */
function morphologicalGroove(u: number, v: number, seed: number): number {
  const h = coarseRelief(u, v, seed);
  const wide = Math.max(0, horizontalBlurRelief(u, v, seed, 0.016) - h);
  const mid = Math.max(0, horizontalBlurRelief(u, v, seed, 0.008) - h);
  return wide * 0.85 + mid * 0.45;
}

function sparseDefectNoise(u: number, v: number, seed: number): number {
  const n1 = multibandFbm(u * 0.52, v * 5.4, seed + 200, 3);
  const n2 = multibandFbm(u * 0.24, v * 2.4, seed + 220, 2);
  const combined = n1 * 0.68 + n2 * 0.32;
  const thresh = 0.7 + hash2(seed, 17, seed + 1) * 0.08;
  return Math.max(0, combined - thresh) / (1 - thresh);
}

function horizontalFissureSeeds(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  maxSeeds: number,
): number {
  const count = 2 + Math.floor(hash2(seed, 99, seed + 301) * maxSeeds);
  let peak = 0;
  for (let i = 0; i < count; i++) {
    const h = i * 5.31 + seed * 0.017 + hash2(i, 2.1, seed) * 1.7;
    const cy = hash2(h, 0, seed + 301) * height;
    const cx = hash2(h, 1, seed + 301) * width;
    const lenBias = hash2(h, 2, seed + 301);
    const halfLen = width * (0.28 + lenBias * 0.62) * 0.5;
    const halfThick = height * (0.001 + hash2(h, 3, seed + 301) * 0.0045);
    const dx = (x - cx) / halfLen;
    const dy = (y - cy) / halfThick;
    const dist2 = dx * dx + dy * dy;
    const depth = hash2(h, 4, seed + 301) * 0.4 + 0.6;
    peak = Math.max(peak, depth * Math.exp(-dist2 * 1.2));
  }
  return peak;
}

function fissureAt(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  maxSeeds: number,
  grooveStrength: number,
): number {
  const u = x / width;
  const v = y / height;
  const grooves = morphologicalGroove(u, v, seed);
  const sparse = sparseDefectNoise(u, v, seed);
  const seams = horizontalFissureSeeds(x, y, width, height, seed, maxSeeds);
  const grooveMix = grooves * grooveStrength;
  return Math.max(seams, grooveMix, sparse * 0.28);
}

function fissureShadow(u: number, v: number, seed: number, grooveStrength: number): number {
  const g = morphologicalGroove(u, v, seed);
  const gDown = morphologicalGroove(u, v + 0.003, seed);
  return Math.max(0, g - gDown) * grooveStrength * 0.35;
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
    fissureStrength = 0.48,
    fineStretch = 72,
    grooveStrength = 0.55,
    coarseBandStrength = 0.04,
    fissureSeeds = 6,
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
      const u = x / width;
      const v = y / height;

      const fine = fineStriations(u, v, seed, fineStretch);
      const fineRight = fineStriations((x + 1) / width, v, seed, fineStretch);
      const fineDown = fineStriations(u, (y + 1) / height, seed, fineStretch);
      const slow = slowToneWash(u, v, seed);

      const field = ridgeFieldAt(x, y, sampleCtx);
      const fieldRight = ridgeFieldAt(x + 1, y, sampleCtx);
      const ridge = ridgeSignal(field);
      const ridgeAccent = ridge * coarseBandStrength;

      const fissure = fissureAt(x, y, width, height, seed, fissureSeeds, grooveStrength);
      const shadow = fissureShadow(u, v, seed, grooveStrength);

      const height01 = 0.5 + fine * 0.145 + slow * 0.03 + ridgeAccent;
      const speck = (hash2(x * 0.9, y * 0.9, seed + 41) - 0.5) * speckle;
      const slopeX = fineRight - fine;
      const slopeY = fineDown - fine;
      const ridgeSlope = ridgeSignal(fieldRight) - ridge;
      const light =
        Math.max(
          -1,
          Math.min(1, slopeX * 0.62 + slopeY * 0.18 + ridgeSlope * coarseBandStrength * 4),
        ) *
        lightStrength *
        2.4;
      const t = clamp01(
        height01 + light * 0.42 + speck - fissure * fissureStrength - shadow * fissureStrength,
      );

      const idx = (y * width + x) * 4;
      data[idx] = mixChannel(palette.dark[0], palette.light[0], t);
      data[idx + 1] = mixChannel(palette.dark[1], palette.light[1], t);
      data[idx + 2] = mixChannel(palette.dark[2], palette.light[2], t);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}
