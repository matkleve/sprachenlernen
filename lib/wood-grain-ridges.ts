/**
 * Procedural wood grain for `/dev/wood-textures` — Liu et al. / Wilkie
 * distortion-field model (simplified 2D tangential face), not warped sine
 * stripes.
 *
 * Research basis:
 * - Liu, Dorsey, Hanrahan, Marschner (LDHM16): cylindrical wood model where
 *   growth rings are sampled at a **distorted** position f(p). Radial
 *   distortion mr(p) bends ring shapes (blister / island bulges); tangential
 *   distortion mt(p) adds figure along the grain. Both are spatial functions
 *   of (x, y) on the board face — see Cornell procedural wood textures paper.
 * - Hafidi & Wilkie (CGF 2025, "From Words to Wood"): influence points exert
 *   repulsive displacement on rings; brushiness distortion.
 * - jsabbott (Olde Tinkerer Studio): practical domain warp — noise vector
 *   feeds Musgrave/noise with anisotropic mapping (high X stretch, low Y).
 *
 * For horizontal face-grain: ring age is primarily y, plus mr(x,y) + mt(x,y)
 * + influence-point displacement. Contour lines of ring age are the ridges.
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
  /** How many ridges fit down the texture height */
  ridgeCount: number;
  /** Distortion-field strength (Wilkie mr / mt scale) */
  warpAmount: number;
  /** Horizontal feature scale for the distortion field */
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

/** Multiband fbm — Wilkie/Liu use ~4 bands for distortion magnitudes. */
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

/** Board-space coords for the distortion field — anisotropic like jsabbott mapping. */
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
 * Hafidi & Wilkie influence points — localized repulsive displacement on
 * ring age (bends rings around a point in both x and y).
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

export type RingSampleContext = {
  width: number;
  height: number;
  seed: number;
  ridgeCount: number;
  warpAmount: number;
  warpFrequency: number;
};

/**
 * Ring age at board position `(x, y)` — the scalar whose contours are ridges.
 * Exported for regression tests. Combines base spacing (y), Wilkie radial
 * distortion mr, tangential distortion mt, and Hafidi influence points.
 */
export function ringAgeAt(x: number, y: number, ctx: RingSampleContext): number {
  const { width, height, seed, ridgeCount, warpAmount, warpFrequency } = ctx;
  const { nx, ny } = distortionCoords(x, y, width, height, ridgeCount, warpFrequency);

  const mr = (multibandFbm(nx, ny, seed) - 0.5) * warpAmount;
  const mt = (multibandFbm(nx + 2.7, ny + 1.3, seed + 47) - 0.5) * warpAmount * 0.52;
  const influence = influenceDisplacement(x, y, width, height, seed + 113, warpAmount * 0.38);

  const base = (y / height) * ridgeCount;
  return base + mr * ridgeCount * 0.48 + mt * ridgeCount * 0.22 + influence * ridgeCount;
}

/** Smoothed band signal from ring age — Liu et al. use a rectangular wave; sin is a close preview. */
function ringSignal(age: number): number {
  return Math.sin(age * Math.PI * 2);
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
  const sampleCtx: RingSampleContext = {
    width,
    height,
    seed,
    ridgeCount,
    warpAmount,
    warpFrequency,
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const age = ringAgeAt(x, y, sampleCtx);
      const ageRight = ringAgeAt(x + 1, y, sampleCtx);
      const ageDown = ringAgeAt(x, y + 1, sampleCtx);

      const ridge = ringSignal(age);
      const slopeX = ringSignal(ageRight) - ridge;
      const slopeY = ringSignal(ageDown) - ridge;

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
