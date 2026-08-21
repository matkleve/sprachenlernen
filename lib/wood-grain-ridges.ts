/**
 * Procedural wood grain rendered as a warped ridge field — hills and
 * valleys, not growth rings, not colour bands. Distinct from
 * `features/wood-grain-lab/` (owner-tunable SVG-filter wood surface for the
 * progression skins): this is the canvas renderer backing the
 * `/dev/wood-textures` species-marking workbench specifically.
 *
 * The reference board (`design/progression/reference-board.png`, columns
 * 1–3) shows undulating horizontal ridges: their height and spacing wander
 * smoothly along x, occasionally merging or splitting, and the light/dark
 * read comes from a raking light across that bump field. One warp field
 * bends a set of horizontal ridges; ridge slope drives brightness the way a
 * real light source would.
 *
 * See docs/study/STUDY-030-procedural-wood-grain.md for why the earlier
 * colour-band and SVG-turbulence attempts read as vertical stripes instead.
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
  /** How far the warp field bends a ridge, in ridge-widths */
  warpAmount: number;
  /** How many warp wobbles fit across the texture width */
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

/** Two octaves — smoother and more organic than one lattice, roughly [-0.6, 0.6]. */
function warpField(x: number, y: number, seed: number): number {
  const n1 = valueNoise(x, y, seed);
  const n2 = valueNoise(x * 2.13, y * 2.13, seed + 91.3) * 0.5;
  return (n1 + n2 - 0.75) / 1.25;
}

function mixChannel(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Vertical noise input in *ridge units*, not height units, and scaled small:
 * one ridge-height step must move the noise field by only a sliver, or a
 * single ridge samples a visibly different warp near its own top vs its own
 * bottom — the curve then folds on itself and reads as broken into pieces
 * instead of flowing continuously left to right. Neighbouring ridges still
 * drift apart over several ridge-steps, which is what lets two ridges merge
 * or split. See STUDY-030 § interrupted ridges.
 */
const VERTICAL_CORRELATION = 0.22;

/** How far (in pixels) the warp field bends the ridge at `(x, y)`. Exported for its own continuity test. */
export function warpOffsetPx(
  x: number,
  y: number,
  width: number,
  ridgeStep: number,
  seed: number,
  warpAmount: number,
  warpFrequency: number,
): number {
  const wx = (x / width) * warpFrequency;
  const wy = (y / ridgeStep) * VERTICAL_CORRELATION;
  return warpField(wx, wy, seed) * warpAmount * ridgeStep;
}

/**
 * Empirical bound on `warpField`'s steepest slope per unit of its own input
 * — two octaves of bilinear value noise, smoothstep-blended. Used only to
 * size the stability clamp below.
 */
const WARP_FIELD_MAX_SLOPE = 2.5;

/**
 * Caps `warpAmount` so the warped ridge cannot fold on itself along x.
 *
 * The ridge traced at a fixed row is `y + warpOffsetPx(x, y, ...)`; as x
 * sweeps across one warp wavelength (`width / warpFrequency` pixels), the
 * offset can swing by up to `2 * warpAmount * ridgeStep`. Once that swing
 * approaches one ridge-step within one wavelength, the traced curve stops
 * being single-valued — it doubles back on itself — and reads as the ridge
 * breaking into disconnected pieces instead of flowing continuously left to
 * right (the defect the owner flagged as "interrupted"). Capping keeps every
 * card size honest to the same warpAmount/warpFrequency the preset authored,
 * shrinking amplitude before it destabilises rather than after. See
 * STUDY-030 § interrupted ridges.
 */
export function stableWarpAmount(
  width: number,
  ridgeStep: number,
  warpFrequency: number,
  warpAmount: number,
): number {
  if (width <= 0 || ridgeStep <= 0 || warpFrequency <= 0) return warpAmount;
  const safetyMargin = 0.6;
  const maxStable = (safetyMargin * width) / (WARP_FIELD_MAX_SLOPE * ridgeStep * warpFrequency);
  return Math.min(warpAmount, maxStable);
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
  const ridgeStep = height / ridgeCount;
  const safeWarpAmount = stableWarpAmount(width, ridgeStep, warpFrequency, warpAmount);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const warp = warpOffsetPx(x, y, width, ridgeStep, seed, safeWarpAmount, warpFrequency);

      const ridge = Math.sin(((y + warp) / ridgeStep) * Math.PI * 2);
      const ridgeAbove = Math.sin(((y - 1 + warp) / ridgeStep) * Math.PI * 2);
      const slope = ridge - ridgeAbove;

      const height01 = ridge * 0.5 + 0.5;
      const speck = (hash2(x * 0.9, y * 0.9, seed + 41) - 0.5) * speckle;
      const light = Math.max(-1, Math.min(1, slope * 6)) * lightStrength;
      const t = Math.max(0, Math.min(1, height01 + light * 0.5 + speck));

      const idx = (y * width + x) * 4;
      data[idx] = mixChannel(palette.dark[0], palette.light[0], t);
      data[idx + 1] = mixChannel(palette.dark[1], palette.light[1], t);
      data[idx + 2] = mixChannel(palette.dark[2], palette.light[2], t);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}
