/**
 * Procedural wood grain — continuous horizontal ridges whose spacing and
 * position are bent by a **2D** domain-warped field, so hills and valleys
 * bulge and pinch like islands on a landscape map (variation in both x and
 * y), not stripes that only slide up and down as x changes.
 *
 * Distinct from `features/wood-grain-lab/` (SVG-filter wood surface for
 * progression skins): canvas renderer for `/dev/wood-textures`.
 *
 * Reference: `design/progression/reference-board.png` columns 1–3.
 * See docs/study/STUDY-030-procedural-wood-grain.md.
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
  /** Domain-warp strength — how far ridge coordinates drift in x and y */
  warpAmount: number;
  /** How many warp features fit across the texture width */
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

/** Fractional Brownian motion — roughly 0..1. */
function fbm(x: number, y: number, seed: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 17.3) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return value / maxValue;
}

function mixChannel(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Normalised sample coordinates — x scaled for warp features, y for ridge count. */
function baseCoords(
  x: number,
  y: number,
  width: number,
  height: number,
  ridgeCount: number,
  warpFrequency: number,
): { nx: number; ny: number } {
  return {
    nx: (x / width) * warpFrequency * 2.8,
    ny: (y / height) * ridgeCount,
  };
}

/**
 * Domain warp in **both** x and y. This is what turns "stripes that only wave
 * on y" into localized bulges and pinches — hills surrounded by valleys in
 * both dimensions, like islands on a terrain map.
 */
function domainWarp2D(
  nx: number,
  ny: number,
  seed: number,
  strength: number,
): { nx: number; ny: number } {
  const offsetX = (valueNoise(nx, ny, seed) * 2 - 1) * strength;
  const offsetY = (valueNoise(nx + 4.1, ny + 2.7, seed + 29) * 2 - 1) * strength;
  return { nx: nx + offsetX, ny: ny + offsetY };
}

export type RidgeSampleContext = {
  width: number;
  height: number;
  seed: number;
  ridgeCount: number;
  warpAmount: number;
  warpFrequency: number;
};

/**
 * Ridge phase at `(x, y)` after 2D domain warp — the value fed to `sin` for
 * the continuous horizontal stripe. Exported for regression tests.
 */
export function ridgePhaseAt(x: number, y: number, ctx: RidgeSampleContext): number {
  const { width, height, seed, ridgeCount, warpAmount, warpFrequency } = ctx;
  const { nx, ny } = baseCoords(x, y, width, height, ridgeCount, warpFrequency);

  const warpStrength = warpAmount * 0.72;
  const w1 = domainWarp2D(nx, ny, seed, warpStrength);
  const w2 = domainWarp2D(w1.nx, w1.ny, seed + 53, warpStrength * 0.5);

  // 2D spacing modulation — ridges merge, split, and bulge like terrain islands
  const spacing = 1 + (fbm(w2.nx, w2.ny, seed + 101, 3) - 0.5) * warpAmount * 0.85;
  const islandBump = (fbm(w2.nx * 1.4, w2.ny * 1.1, seed + 211, 2) - 0.5) * warpAmount * 0.35;

  return (w2.ny + islandBump) * spacing * Math.PI * 2;
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
  const sampleCtx: RidgeSampleContext = {
    width,
    height,
    seed,
    ridgeCount,
    warpAmount,
    warpFrequency,
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const phase = ridgePhaseAt(x, y, sampleCtx);
      const phaseRight = ridgePhaseAt(x + 1, y, sampleCtx);
      const phaseDown = ridgePhaseAt(x, y + 1, sampleCtx);

      const ridge = Math.sin(phase);
      const slopeX = Math.sin(phaseRight) - ridge;
      const slopeY = Math.sin(phaseDown) - ridge;

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
