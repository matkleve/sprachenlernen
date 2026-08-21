/**
 * Procedural wood grain for `/dev/wood-textures` — multi-scale horizontal
 * fibre layers rendered as canvas ridges.
 *
 * Visual model (spec: wood-texture-lab.md, study: STUDY-030):
 * - `ridgeCount` — how many coarse horizontal bands fit the swatch height
 * - `warpAmount` / `warpFrequency` — irregularity within each scale (2D field)
 * - `speckle` — fine hairline variation on top
 * - palette + raking light — species tone and matte/oiled read
 *
 * Not botanic growth rings. Internal `ridgeFieldAt` is a contour height field;
 * papers in STUDY-sources are background only.
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

/** Board-space coords for the irregularity field — anisotropic (high X, low Y). */
function distortionCoords(
  x: number,
  y: number,
  width: number,
  height: number,
  ridgeCount: number,
  warpFrequency: number,
): { nx: number; ny: number } {
  return {
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
 * Height field for horizontal grain contours. Base spacing is mostly vertical
 * (horizontal fibres on a face-grain plank) plus 2D warp so ridges vary in both
 * x and y — not separable vertical stripes.
 */
export function ridgeFieldAt(x: number, y: number, ctx: RidgeFieldContext): number {
  const { width, height, seed, ridgeCount, warpAmount, warpFrequency } = ctx;
  const { nx, ny } = distortionCoords(x, y, width, height, ridgeCount, warpFrequency);

  const mr = (multibandFbm(nx, ny, seed) - 0.5) * warpAmount;
  const mt = (multibandFbm(nx + 2.7, ny + 1.3, seed + 47) - 0.5) * warpAmount * 0.52;
  const influence = influenceDisplacement(x, y, width, height, seed + 113, warpAmount * 0.38);

  // Mostly-horizontal contours: base spacing from y, curved by 2D warp
  const cx = width * 0.5;
  const cy = -height * 2.8;
  const dx = (x - cx) / width;
  const dy = (y - cy) / height;
  const radius = Math.sqrt(dx * dx + dy * dy);

  const ringScale = ridgeCount / 1.15;
  return radius * ringScale + mr * ridgeCount * 0.42 + mt * ridgeCount * 0.18 + influence * ridgeCount;
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
  const { seed, palette, ridgeCount, warpAmount, warpFrequency, lightStrength, speckle } = opts;
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
      const fieldDown = ridgeFieldAt(x, y + 1, sampleCtx);

      const ridge = ridgeSignal(field);
      const slopeX = ridgeSignal(fieldRight) - ridge;
      const slopeY = ridgeSignal(fieldDown) - ridge;

      const height01 = ridge * 0.5 + 0.5;
      const speck = (hash2(x * 0.9, y * 0.9, seed + 41) - 0.5) * speckle;
      const light = Math.max(-1, Math.min(1, slopeX * 0.35 + slopeY * 0.65)) * lightStrength * 3;
      const t = clamp01(height01 + light * 0.5 + speck);

      const idx = (y * width + x) * 4;
      data[idx] = mixChannel(palette.dark[0], palette.light[0], t);
      data[idx + 1] = mixChannel(palette.dark[1], palette.light[1], t);
      data[idx + 2] = mixChannel(palette.dark[2], palette.light[2], t);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}
