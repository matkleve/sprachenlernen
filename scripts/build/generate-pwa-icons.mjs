#!/usr/bin/env node
/**
 * Rasterise public/icon.svg into PNGs for iOS Home Screen and the web manifest.
 * iOS ignores SVG for Add to Home Screen — it needs apple-touch-icon.png.
 *
 * Uses npx @resvg/resvg-js-cli (no package.json dependency).
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const svg = join(ROOT, "public/icon.svg");

if (!existsSync(svg)) {
  console.error(`Missing ${svg}`);
  process.exit(1);
}

const outputs = [
  { width: 180, file: "public/apple-touch-icon.png" },
  { width: 192, file: "public/icon-192.png" },
  { width: 512, file: "public/icon-512.png" },
];

for (const { width, file } of outputs) {
  const out = join(ROOT, file);
  execSync(
    `npx --yes @resvg/resvg-js-cli --fit-width ${width} "${svg}" "${out}"`,
    { stdio: "inherit", cwd: ROOT },
  );
  console.log(`Wrote ${file}`);
}
