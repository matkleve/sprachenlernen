/**
 * Renders procedural wood to PNG for calibration — run via scripts/wood-calibration.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { RAW_PLANKS_GRAIN } from "@/lib/wood-grain-presets";
import { fillWoodGrainBuffer } from "@/lib/wood-grain-ridges";
import { writeRgbPng } from "../scripts/lib/png.mjs";

const OUT_DIR = join(process.cwd(), "design/progression/calibration");
const SIZE = 507;

describe("wood grain calibration export", () => {
  it("writes raw-planks procedural PNG for texture-metrics", () => {
    const data = new Uint8ClampedArray(SIZE * SIZE * 4);
    fillWoodGrainBuffer(data, SIZE, SIZE, RAW_PLANKS_GRAIN);
    mkdirSync(OUT_DIR, { recursive: true });
    const outPath = join(OUT_DIR, "procedural-raw-planks-507.png");
    writeFileSync(outPath, writeRgbPng(SIZE, SIZE, data));
    expect(data.length).toBe(SIZE * SIZE * 4);
  });
});
