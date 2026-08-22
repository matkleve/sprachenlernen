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
    Ls.push(L);                       // index-aligned with `chroma` below
    const c = Math.hypot(a, b);
    chroma.push(c);
    if (c > 1e-4) { hx += a; hy += b; }
  }
  // Colour conditioned on lightness. Median lightness and mean chroma can both
  // match while the material looks wrong, because what differs is how chroma
  // moves *with* lightness. Measure it rather than assuming: this reference's
  // chroma RISES with lightness (0.050 -> 0.059), so its light grain is warm,
  // not pale — the opposite of the intuition that light grain is desaturated.
  // Other species may well go the other way. That is the point of measuring.
  const byL = Ls.map((L, i) => ({ L, C: chroma[i] }));
  byL.sort((p, q) => p.L - q.L);
  const QUINT = 5;
  const quintiles = [];
  for (let q = 0; q < QUINT; q++) {
    const sl = byL.slice(Math.floor(q * byL.length / QUINT), Math.floor((q + 1) * byL.length / QUINT));
    quintiles.push({
      L: sl.reduce((a, v) => a + v.L, 0) / sl.length,
      C: sl.reduce((a, v) => a + v.C, 0) / sl.length,
    });
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

  // --- sorted distribution: the whole curve, not a few landmarks on it
  //
  // Sort every pixel by lightness and compare the two curves point for point.
  // This is the most diagnostic thing in the suite and the cheapest: a texture
  // whose transfer function saturates shows a dead flat run at one or both ends
  // — many pixels sharing one value — which every summary statistic averages
  // away. Clipped highlights read as "no bright spots" long before any mean or
  // quintile notices.
  const sortedL = [...Ls].sort((p, q) => p - q);
  const sortedC = [...chroma].sort((p, q) => p - q);
  const QS = [0, 1, 5, 25, 50, 75, 95, 99, 100];
  const pick = (arr, q) => arr[Math.min(arr.length - 1, Math.round(q / 100 * (arr.length - 1)))];
  const curveL = QS.map((q) => pick(sortedL, q));
  const curveC = QS.map((q) => pick(sortedC, q));
  // How much tail is left above p95 and below p5, relative to the body of the
  // distribution. Near zero means the transfer saturated and the extremes were
  // cut off. Counting pixels that share the maximum value does NOT work here —
  // a low-variance signal has few distinct 8-bit levels and looks clipped when
  // it is merely compressed.
  const p50 = pick(sortedL, 50), p95 = pick(sortedL, 95), p5 = pick(sortedL, 5);
  const p100 = pick(sortedL, 100), p0 = pick(sortedL, 0);
  const tailHigh = p100 - p50 > 1e-6 ? (p100 - p95) / (p100 - p50) : 0;
  const tailLow = p50 - p0 > 1e-6 ? (p5 - p0) / (p50 - p0) : 0;

  // --- pairing: is the light next to the dark, or somewhere else entirely?
  //
  // A grain line is a groove. Lit from one side it has a shadowed wall and a
  // bright wall, so its dark and light are the SAME feature, a pixel or two
  // apart. Independent dark and light layers cannot produce that however well
  // each one is tuned. It shows up as a negative lobe in the vertical
  // autocorrelation: `pairing` is that lobe's depth and `pairingLag` its
  // distance in pixels. No lobe means the light is decorative rather than
  // caused by anything.
  const PLAG = 14;
  const vacf = new Float64Array(PLAG + 1);
  for (let x = 0; x < W; x++) {
    const v = new Float64Array(H);
    let mu = 0;
    for (let y = 0; y < H; y++) { v[y] = oklab(...at(x, y))[0]; mu += v[y]; }
    mu /= H;
    for (let y = 0; y < H; y++) v[y] -= mu;
    for (let lag = 0; lag <= PLAG; lag++) {
      let sum = 0;
      for (let y = 0; y + lag < H; y++) sum += v[y] * v[y + lag];
      vacf[lag] += sum / (H - lag);
    }
  }
  let pairing = 0, pairingLag = 0;
  if (vacf[0] > 0) {
    for (let lag = 1; lag <= PLAG; lag++) {
      const r = vacf[lag] / vacf[0];
      if (r < pairing) { pairing = r; pairingLag = lag; }
    }
  }

  // --- aspect: how many times longer is a feature than it is tall?
  //
  // `directionality` answers "is there a dominant direction" but its noise floor
  // on real material is ~1.4, so it cannot rank two textures that both run
  // horizontally. This can. Autocorrelate along each axis, take the lag at which
  // correlation falls to 1/e, and divide. A value of 6 means features are six
  // times wider than tall. It is the number to reach for when something looks
  // "too stretched", because it is exactly that and nothing else.
  const acLen = (axis) => {
    const N = axis === "x" ? W : H, M = axis === "x" ? H : W;
    const maxLag = Math.min(64, N - 1);
    const acf = new Float64Array(maxLag + 1);
    for (let l = 0; l < M; l++) {
      const v = new Float64Array(N);
      let mu = 0;
      for (let i = 0; i < N; i++) { v[i] = oklab(...(axis === "x" ? at(i, l) : at(l, i)))[0]; mu += v[i]; }
      mu /= N;
      for (let i = 0; i < N; i++) v[i] -= mu;
      for (let lag = 0; lag <= maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i + lag < N; i++) sum += v[i] * v[i + lag];
        acf[lag] += sum / (N - lag);
      }
    }
    if (acf[0] <= 0) return 1;
    for (let lag = 1; lag <= maxLag; lag++) {
      if (acf[lag] / acf[0] < Math.exp(-1)) {
        const prev = acf[lag - 1] / acf[0], cur = acf[lag] / acf[0];
        return lag - 1 + (prev - Math.exp(-1)) / Math.max(prev - cur, 1e-9);
      }
    }
    return maxLag;
  };
  const aspect = acLen("x") / Math.max(acLen("y"), 1e-6);

  // --- run length: do dark features run, or do they close into blobs?
  //
  // Galloway's run-length texture feature. Threshold at the 30th percentile of
  // lightness, then measure how far a dark region continues along the grain
  // before it ends, as a fraction of the image width. A grain crack runs a long
  // way; a closed loop cannot run further than its own diameter. This is the
  // one that separates "grain" from "stretched circles" — orientation and
  // structure-tensor coherence both score those the same, which is how a
  // too-low anisotropy once got shipped as an improvement.
  const cut = Ls[Math.floor(0.30 * (Ls.length - 1))];
  let runSum = 0, runCount = 0;
  for (let y = 0; y < H; y++) {
    let run = 0;
    for (let x = 0; x < W; x++) {
      if (oklab(...at(x, y))[0] <= cut) run++;
      else { if (run) { runSum += run; runCount++; } run = 0; }
    }
    if (run) { runSum += run; runCount++; }
  }
  const runLength = runCount ? runSum / runCount / W : 0;

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
    runLength,
    quintiles,
    aspect,
    pairing,
    pairingLag,
    curveL,
    curveC,
    tailHigh,
    tailLow,
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
    runLength: cand.runLength - ref.runLength,
    aspectRatio: cand.aspect / ref.aspect,
    pairing: cand.pairing - ref.pairing,
    curveDistL: cand.curveL.reduce((a, v, i) => a + Math.abs(v - ref.curveL[i]), 0) / ref.curveL.length,
    curveDistC: cand.curveC.reduce((a, v, i) => a + Math.abs(v - ref.curveC[i]), 0) / ref.curveC.length,
    lightnessRange: (cand.quintiles[4].L - cand.quintiles[0].L) - (ref.quintiles[4].L - ref.quintiles[0].L),
    chromaProfile: Math.sqrt(ref.quintiles.reduce((a, q, i) =>
      a + (cand.quintiles[i].C - q.C) ** 2, 0) / ref.quintiles.length),
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
    `directionality ${directionality(ref).toFixed(2)}   runLength ${ref.runLength.toFixed(3)}   aspect ${ref.aspect.toFixed(1)}:1`);
  console.log(`  scale bands (coarse->fine)  ${ref.rad.map((v) => (v * 100).toFixed(0).padStart(3)).join("")}`);
  console.log(`  sorted L  p0/1/5/25/50/75/95/99/100  ${ref.curveL.map((v) => v.toFixed(3).padStart(6)).join("")}`);
  console.log(`  by lightness quintile  L ${ref.quintiles.map((q) => q.L.toFixed(2).padStart(6)).join("")}`);
  console.log(`                         C ${ref.quintiles.map((q) => q.C.toFixed(3).padStart(6)).join("")}`);

  for (const path of cands) {
    const c = measure(readPng(readFileSync(path)));
    const d = compare(ref, c);
    console.log(`\ncandidate  ${path}`);
    console.log(`  tone        ${f(d.tone)}   ${Math.abs(d.tone) > 0.05 ? (d.tone < 0 ? "<< too dark" : "<< too light") : "ok"}`);
    console.log(`  contrast    ${f(d.contrast)}   ${Math.abs(d.contrast) > 0.04 ? (d.contrast < 0 ? "<< tonal range too narrow" : "<< tonal range too wide") : "ok"}`);
    console.log(`  chroma      ${f(d.chroma, 4)}   ${Math.abs(d.chroma) > 0.01 ? (d.chroma < 0 ? "<< too grey" : "<< too saturated") : "ok"}`);
    console.log(`  hue         ${f(d.hue, 0)}deg`);
    console.log(`  skew        ${f(d.skew, 2)}`);
    console.log(`  lightRange  ${f(d.lightnessRange, 3)}   ${d.lightnessRange < -0.03 ? "<< no light grain — darks and lights too close" : "ok"}`);
    console.log(`  chromaByL   ${d.chromaProfile.toFixed(4)}   L ${c.quintiles.map((q) => q.L.toFixed(2).padStart(6)).join("")}`);
    console.log(`                       C ${c.quintiles.map((q) => q.C.toFixed(3).padStart(6)).join("")}`);
    console.log(`  localCtrst  ${f(d.localContrast, 4)}`);
    console.log(`  aspect      ${c.aspect.toFixed(1)}:1 vs ${ref.aspect.toFixed(1)}:1   x${d.aspectRatio.toFixed(2)}   ${d.aspectRatio > 1.35 ? "<< too stretched" : d.aspectRatio < 0.74 ? "<< not stretched enough" : "ok"}`);
    console.log(`  sortedL     ${c.curveL.map((v) => v.toFixed(3).padStart(6)).join("")}   dist ${d.curveDistL.toFixed(4)}`);
    console.log(`  tails       high ${c.tailHigh.toFixed(2)} vs ${ref.tailHigh.toFixed(2)}, low ${c.tailLow.toFixed(2)} vs ${ref.tailLow.toFixed(2)}` +
      `   ${c.tailHigh < ref.tailHigh * 0.5 ? "<< highlights clipped off" : c.tailLow < ref.tailLow * 0.5 ? "<< shadows clipped off" : "ok"}`);
    console.log(`  pairing     ${c.pairing.toFixed(3)} at lag ${c.pairingLag} vs ${ref.pairing.toFixed(3)} at lag ${ref.pairingLag}   ${c.pairing > ref.pairing + 0.06 ? "<< light not caused by the dark — no groove shading" : "ok"}`);
    console.log(`  runLength   ${f(d.runLength, 3)}   ${d.runLength < -0.02 ? "<< features breaking up / closing into loops" : d.runLength > 0.02 ? "<< features too continuous" : "ok"}`);
    console.log(`  orientation ${d.orientation.toFixed(2)}   (directionality ${directionality(c).toFixed(2)} vs ${directionality(ref).toFixed(2)})`);
    console.log(`  scale       ${d.scale.toFixed(2)}   bands ${c.rad.map((v) => (v * 100).toFixed(0).padStart(3)).join("")}`);
  }
}
