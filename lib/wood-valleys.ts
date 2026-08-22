/**
 * Sparse procedural valleys for wood grain — heavy-tailed, horizontal, no assets.
 */

export type WoodValleyOptions = {
  strength: number;
  threshold: number;
  runWidth: number;
  bandHeight: number;
  frequency: number;
};

export const DEFAULT_WOOD_VALLEYS: WoodValleyOptions = {
  strength: 0.65,
  threshold: 0.28,
  runWidth: 48,
  bandHeight: 1,
  frequency: 3.8,
};

function hash2(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

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

function valleyNoiseAt(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  frequency: number,
): number {
  const nx = (x / width) * frequency * 2.4;
  const ny = (y / height) * frequency * 0.35;
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < 3; i++) {
    value += valueNoise(nx * freq, ny * freq, seed + 401 + i * 17) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return value / max;
}

/** Raw depth 0–1 at one pixel (before horizontal pooling). */
export function valleyDepthRaw(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  threshold: number,
  frequency: number,
): number {
  const n = valleyNoiseAt(x, y, width, height, seed, frequency);
  if (n >= threshold) return 0;
  return (threshold - n) / threshold;
}

/**
 * Precompute elongated valley depth for a full swatch — O(w×h×runWidth), once per render.
 */
export function buildValleyMap(
  width: number,
  height: number,
  seed: number,
  opts: WoodValleyOptions,
): Float32Array {
  const raw = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      raw[y * width + x] = valleyDepthRaw(
        x,
        y,
        width,
        height,
        seed,
        opts.threshold,
        opts.frequency,
      );
    }
  }

  const halfW = Math.max(1, Math.floor(opts.runWidth / 2));
  const halfH = Math.max(0, Math.floor(opts.bandHeight / 2));
  const out = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let peak = 0;
      for (let dy = -halfH; dy <= halfH; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -halfW; dx <= halfW; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          const d = raw[yy * width + xx] ?? 0;
          if (d > peak) peak = d;
        }
      }
      out[y * width + x] = peak * opts.strength;
    }
  }
  return out;
}

/** Sample precomputed map (use buildValleyMap once per render). */
export function valleyDepthAt(
  x: number,
  y: number,
  width: number,
  _height: number,
  _seed: number,
  opts: WoodValleyOptions,
  map?: Float32Array,
): number {
  if (map) {
    if (x < 0 || y < 0 || x >= width) return 0;
    return map[y * width + x] ?? 0;
  }
  // Fallback for unit tests — single pixel with local pool
  const height = _height;
  const seed = _seed;
  const halfW = Math.max(1, Math.floor(opts.runWidth / 2));
  const halfH = Math.max(0, Math.floor(opts.bandHeight / 2));
  let peak = 0;
  for (let dy = -halfH; dy <= halfH; dy++) {
    for (let dx = -halfW; dx <= halfW; dx++) {
      const d = valleyDepthRaw(x + dx, y + dy, width, height, seed, opts.threshold, opts.frequency);
      if (d > peak) peak = d;
    }
  }
  return peak * opts.strength;
}
