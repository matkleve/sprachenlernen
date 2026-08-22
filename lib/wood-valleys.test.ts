import { describe, expect, it } from "vitest";

import { buildValleyMap, valleyDepthRaw, DEFAULT_WOOD_VALLEYS } from "@/lib/wood-valleys";

describe("wood-valleys", () => {
  const w = 240;
  const h = 200;
  const seed = 11;

  it("returns zero depth above threshold", () => {
    let foundZero = false;
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const raw = valleyDepthRaw(x, y, w, h, seed, 0.5, 3.8);
        if (raw === 0) foundZero = true;
      }
    }
    expect(foundZero).toBe(true);
  });

  it("horizontal max-pool elongates fissures along x", () => {
    const raw = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        raw[y * w + x] = valleyDepthRaw(x, y, w, h, seed, DEFAULT_WOOD_VALLEYS.threshold, DEFAULT_WOOD_VALLEYS.frequency);
      }
    }
    const map = buildValleyMap(w, h, seed, DEFAULT_WOOD_VALLEYS);
    const maxRun = (field: Float32Array, alongX: boolean) => {
      let best = 0;
      if (alongX) {
        for (let y = 0; y < h; y++) {
          let run = 0;
          for (let x = 0; x < w; x++) {
            if ((field[y * w + x] ?? 0) > 0.08) {
              run++;
              best = Math.max(best, run);
            } else run = 0;
          }
        }
      } else {
        for (let x = 0; x < w; x++) {
          let run = 0;
          for (let y = 0; y < h; y++) {
            if ((field[y * w + x] ?? 0) > 0.08) {
              run++;
              best = Math.max(best, run);
            } else run = 0;
          }
        }
      }
      return best;
    };
    expect(maxRun(map, true)).toBeGreaterThan(maxRun(raw, true));
  });

  it("keeps ink fraction sparse on a 210×210 swatch", () => {
    const size = 210;
    const map = buildValleyMap(size, size, seed, DEFAULT_WOOD_VALLEYS);
    let ink = 0;
    for (let i = 0; i < map.length; i++) {
      if ((map[i] ?? 0) > 0.12) ink++;
    }
    const fraction = ink / map.length;
    expect(fraction).toBeGreaterThan(0.005);
    expect(fraction).toBeLessThan(0.04);
  });
});
