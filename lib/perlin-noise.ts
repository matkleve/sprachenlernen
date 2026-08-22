/**
 * Tileable 2D Perlin noise on a 256-period lattice. Framework-free.
 */

const PERM_SIZE = 256;

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function buildPerm(seed: number): Uint8Array {
  const perm = new Uint8Array(PERM_SIZE * 2);
  const source = Array.from({ length: PERM_SIZE }, (_, index) => index);

  let state = seed >>> 0;
  for (let index = PERM_SIZE - 1; index > 0; index--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const tmp = source[index]!;
    source[index] = source[swap]!;
    source[swap] = tmp;
  }

  for (let index = 0; index < PERM_SIZE; index++) {
    perm[index] = source[index]!;
    perm[index + PERM_SIZE] = source[index]!;
  }

  return perm;
}

function perlin2D(perm: Uint8Array, x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[xi]! + yi]!;
  const ab = perm[perm[xi]! + yi + 1]!;
  const ba = perm[perm[xi + 1]! + yi]!;
  const bb = perm[perm[xi + 1]! + yi + 1]!;

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);

  return lerp(x1, x2, v);
}

/** Seamless noise — u,v in [0,1). */
export function tileablePerlin2D(perm: Uint8Array, u: number, v: number): number {
  return perlin2D(perm, u * PERM_SIZE, v * PERM_SIZE);
}

export type FbmOptions = {
  octaves?: number;
  lacunarity?: number;
  gain?: number;
};

export function tileableFbm2D(
  perm: Uint8Array,
  x: number,
  y: number,
  { octaves = 4, lacunarity = 2, gain = 0.5 }: FbmOptions = {},
): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let norm = 0;

  for (let octave = 0; octave < octaves; octave++) {
    sum += amplitude * tileablePerlin2D(perm, (x * frequency) % 1, (y * frequency) % 1);
    norm += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / norm;
}

export function createPermutation(seed: number): Uint8Array {
  return buildPerm(seed);
}
