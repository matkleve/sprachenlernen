#!/usr/bin/env node
/**
 * Procedural wood calibration pipeline — designer + mathematician loop.
 *
 * 1. Reference: board Workshop col 1 bench crop (or wood-01 patch fallback)
 * 2. Candidate: canvas renderer (lib/wood-grain-ridges.ts) via vitest export
 * 3. Diff: scripts/texture-metrics.mjs
 *
 * Usage:
 *   node scripts/wood-calibration.mjs
 *   node scripts/wood-calibration.mjs design/progression/metrics-crops/board-workshop-1-bench.png
 *
 * Pass/fail checklist: design/progression/CALIBRATION.md
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const defaultRef = join(
  root,
  "design/progression/metrics-crops/board-workshop-1-bench.png",
);
const ref = process.argv[2] ?? defaultRef;
const candidate = join(root, "design/progression/calibration/procedural-raw-planks-507.png");

if (!existsSync(ref)) {
  console.error(`Reference missing: ${ref}`);
  console.error("⚠ SPEC GAP: commit design/progression/reference-board.png and crops");
  process.exit(1);
}

console.log("→ Rendering procedural raw-planks (507×507)…");
execSync("npx vitest run lib/wood-grain-calibration.test.ts", {
  cwd: root,
  stdio: "inherit",
});

console.log(`\n→ Metrics: ${ref} vs procedural\n`);
execSync(`node scripts/texture-metrics.mjs "${ref}" "${candidate}"`, {
  cwd: root,
  stdio: "inherit",
});

console.log("\nChecklist: design/progression/CALIBRATION.md");
console.log("Tune: lib/wood-grain-presets.ts → npm run test -- lib/wood-valleys");
