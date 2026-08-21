#!/usr/bin/env node
/**
 * Compare two texture images and report where they differ.
 *
 *   node scripts/texture-metrics.mjs reference.png candidate.png [more.png ...]
 *
 * Why this exists: judging "does this look like wood" from a screenshot is the
 * weakest link when an agent iterates on a material. Measuring is the strong
 * link. These numbers turn a taste argument into a diff — but they are a
 * diagnostic, not a target. See docs/study/STUDY-030-texture-metrics.md for the
 * ways they mislead, which are real and were hit while building them.
 *
 * Every metric is scale-normalised, so images of different sizes compare fine.
 */
import { readFileSync } from "node:fs";
import { readPng } from "./lib/png.mjs";

/* ---------- colour ------------------------------------------------------ */

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** OKLab — perceptually uniform, so "how much lighter" and "how much more
 *  saturated" mean the same thing at every brightness. */
function oklab(r, g, b) {
  const R = srgbToLinear(r / 255), G = srgbToLinear(g / 255), B = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

/* ---------- FFT --------------------------------------------------------- */

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
      const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
      const ur = re[i + k], ui = im[i + k];
      const vr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
      const vi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
      re[i + k] = ur + vr; im[i + k] = ui + vi;
      re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
    }
  }
}
const hann = (n) => Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)));

/* ---------- measurement -------------------------------------------------- */

const ANG_BINS = 12, RAD_BINS = 6, FFT_W = 256, FFT_H = 128;

export function measure(png) {
  const { width: W, height: H, channels: C, data } = png;
  const at = (x, y) => { const i = (W * y + x) * C; return [data[i], data[i + 1], data[i + 2]]; };

  // --- tone, colour, and the shape of the value distribution
  const Ls = [], chroma = [];
  let hx = 0, hy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [L, a, b] = oklab(...at(x, y));
    Ls.push(L);
    const c = Math.hypot(a, b);
    chroma.push(c);
    if (c > 1e-4) { hx += a; hy += b; }
  }
  Ls.sort((p, q) => p - q);
  const q = (t) => Ls[Math.floor(t * (Ls.length - 1))];
  const mean = Ls.reduce((s, v) => s + v, 0) / Ls.length;
  const sd = Math.sqrt(Ls.reduce((s, v) => s + (v - mean) ** 2, 0) / Ls.length);
  // Negative skew == mostly light with narrow dark notches, which is what a
  // grain crack is. Positive == mostly dark with bright specks (brass, stars).
  const skew = sd < 1e-6 ? 0 : Ls.reduce((s, v) => s + ((v - mean) / sd) ** 3, 0) / Ls.length;

  // --- local contrast: how sharply values change over one pixel
  let grad = 0, gn = 0;
  for (let y = 1; y < H; y++) for (let x = 1; x < W; x++) {
    const c0 = oklab(...at(x, y))[0];
    grad += Math.abs(c0 - oklab(...at(x - 1, y))[0]) + Math.abs(c0 - oklab(...at(x, y - 1))[0]);
    gn += 2;
  }

  // --- 2-D spectrum, binned by orientation and by scale
  const g = [];
  for (let y = 0; y < FFT_H; y++) {
    const row = [];
    for (let x = 0; x < FFT_W; x++) {
      const sx = Math.min(W - 1, Math.round(x * W / FFT_W));
      const sy = Math.min(H - 1, Math.round(y * H / FFT_H));
      row.push(oklab(...at(sx, sy))[0]);
    }
    g.push(row);
  }
  let gm = 0; for (const r of g) for (const v of r) gm += v; gm /= FFT_W * FFT_H;
  const wx = hann(FFT_W), wy = hann(FFT_H);
  const re = [], im = [];
  for (let y = 0; y < FFT_H; y++) {
    re.push(new Float64Array(FFT_W)); im.push(new Float64Array(FFT_W));
    for (let x = 0; x < FFT_W; x++) re[y][x] = (g[y][x] - gm) * wx[x] * wy[y];
  }
  for (let y = 0; y < FFT_H; y++) fft(re[y], im[y]);
  for (let x = 0; x < FFT_W; x++) {
    const cr = new Float64Array(FFT_H), ci = new Float64Array(FFT_H);
    for (let y = 0; y < FFT_H; y++) { cr[y] = re[y][x]; ci[y] = im[y][x]; }
    fft(cr, ci);
    for (let y = 0; y < FFT_H; y++) { re[y][x] = cr[y]; im[y][x] = ci[y]; }
  }
  const ang = new Float64Array(ANG_BINS), rad = new Float64Array(RAD_BINS);
  let total = 0;
  for (let y = 0; y < FFT_H; y++) for (let x = 0; x < FFT_W; x++) {
    const fy = (y < FFT_H / 2 ? y : y - FFT_H) / FFT_H;
    const fx = (x < FFT_W / 2 ? x : x - FFT_W) / FFT_W;
    if (!fx && !fy) continue;
    const r = Math.hypot(fx, fy);
    if (r < 0.008 || r > 0.5) continue;
    const p = re[y][x] ** 2 + im[y][x] ** 2;
    let a = Math.atan2(Math.abs(fy), fx); if (a < 0) a += Math.PI;
    ang[Math.min(ANG_BINS - 1, Math.floor(a / Math.PI * ANG_BINS))] += p;
    rad[Math.min(RAD_BINS - 1, Math.floor(Math.log2(r / 0.008) / Math.log2(0.5 / 0.008) * RAD_BINS))] += p;
    total += p;
  }

  const meanChroma = chroma.reduce((s, v) => s + v, 0) / chroma.length;
  return {
    toneMid: q(0.5), toneLow: q(0.05), toneHigh: q(0.95),
    contrast: q(0.95) - q(0.05),
    skew,
    chroma: meanChroma,
    hue: (Math.atan2(hy, hx) * 180 / Math.PI + 360) % 360,
    localContrast: grad / gn,
    ang: Array.from(ang, (v) => v / total),
    rad: Array.from(rad, (v) => v / total),
  };
}

/** Energy in the wedge around the dominant orientation — 1.0 = perfectly
 *  directional (grain, brushed metal), ~0.17 = no direction at all (paper). */
export const directionality = (m) => Math.max(...m.ang.map((_, i) =>
  m.ang[i] + m.ang[(i + 1) % ANG_BINS])) ;

export function compare(ref, cand) {
  const logs = (a, b) => Math.log(Math.max(b, 1e-4) / Math.max(a, 1e-4)) ** 2;
  let orient = 0, scale = 0;
  for (let i = 0; i < ANG_BINS; i++) orient += logs(ref.ang[i], cand.ang[i]);
  for (let i = 0; i < RAD_BINS; i++) scale += logs(ref.rad[i], cand.rad[i]);
  return {
    tone: cand.toneMid - ref.toneMid,
    contrast: cand.contrast - ref.contrast,
    chroma: cand.chroma - ref.chroma,
    hue: ((cand.hue - ref.hue + 540) % 360) - 180,
    skew: cand.skew - ref.skew,
    localContrast: cand.localContrast - ref.localContrast,
    orientation: Math.sqrt(orient),
    scale: Math.sqrt(scale),
  };
}

/* ---------- report ------------------------------------------------------- */

if (process.argv[1]?.endsWith("texture-metrics.mjs")) {
  const [refPath, ...cands] = process.argv.slice(2);
  if (!refPath || !cands.length) {
    console.error("usage: node scripts/texture-metrics.mjs reference.png candidate.png [...]");
    process.exit(1);
  }
  const ref = measure(readPng(readFileSync(refPath)));
  const f = (v, d = 3) => (v >= 0 ? "+" : "") + v.toFixed(d);

  console.log(`reference  ${refPath}`);
  console.log(`  tone(mid) ${ref.toneMid.toFixed(3)}   contrast ${ref.contrast.toFixed(3)}   ` +
    `chroma ${ref.chroma.toFixed(4)}   hue ${ref.hue.toFixed(0)}deg`);
  console.log(`  skew ${ref.skew.toFixed(2)}   localContrast ${ref.localContrast.toFixed(4)}   ` +
    `directionality ${directionality(ref).toFixed(2)}`);
  console.log(`  scale bands (coarse->fine)  ${ref.rad.map((v) => (v * 100).toFixed(0).padStart(3)).join("")}`);

  for (const path of cands) {
    const c = measure(readPng(readFileSync(path)));
    const d = compare(ref, c);
    console.log(`\ncandidate  ${path}`);
    console.log(`  tone        ${f(d.tone)}   ${Math.abs(d.tone) > 0.05 ? (d.tone < 0 ? "<< too dark" : "<< too light") : "ok"}`);
    console.log(`  contrast    ${f(d.contrast)}`);
    console.log(`  chroma      ${f(d.chroma, 4)}   ${Math.abs(d.chroma) > 0.01 ? (d.chroma < 0 ? "<< too grey" : "<< too saturated") : "ok"}`);
    console.log(`  hue         ${f(d.hue, 0)}deg`);
    console.log(`  skew        ${f(d.skew, 2)}`);
    console.log(`  localCtrst  ${f(d.localContrast, 4)}`);
    console.log(`  orientation ${d.orientation.toFixed(2)}   (directionality ${directionality(c).toFixed(2)} vs ${directionality(ref).toFixed(2)})`);
    console.log(`  scale       ${d.scale.toFixed(2)}   bands ${c.rad.map((v) => (v * 100).toFixed(0).padStart(3)).join("")}`);
  }
}
