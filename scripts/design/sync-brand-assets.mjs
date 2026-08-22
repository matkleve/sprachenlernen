#!/usr/bin/env node
/**
 * Promote a chosen logo direction to the shipped PWA / favicon assets.
 * Usage: node scripts/sync-brand-assets.mjs <direction-id>
 * Example: node scripts/sync-brand-assets.mjs fanned-pages
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

const LOGO_BUILDERS = {
  "fanned-pages": "scripts/design/build-fanned-pages-logo.py",
  "steady-path": "scripts/design/build-steady-path-logo.py",
  "spiral-learning": "scripts/design/build-spiral-learning-logo.py",
};

const id = process.argv[2];
if (id && LOGO_BUILDERS[id]) {
  execSync(`python3 ${LOGO_BUILDERS[id]}`, { stdio: "inherit", cwd: ROOT });
}
const directionsPath = join(ROOT, "data/brand/logo-directions.json");
const directions = JSON.parse(readFileSync(directionsPath, "utf8"));

if (!id) {
  console.error("Usage: node scripts/sync-brand-assets.mjs <direction-id>");
  console.error("Directions:", directions.map((d) => d.id).join(", "));
  process.exit(1);
}

const direction = directions.find((entry) => entry.id === id);
if (!direction) {
  console.error(`Unknown direction: ${id}`);
  process.exit(1);
}

const sourceName = `${id}.svg`;
const source = join(ROOT, "design/logo/directions", sourceName);
const appIconSource = join(ROOT, "design/logo/directions", `${id}-app-icon.svg`);
const iconSource = existsSync(appIconSource) ? appIconSource : source;
if (!existsSync(source)) {
  console.error(`Missing source: ${source}`);
  process.exit(1);
}

const targets = [
  join(ROOT, "public/icon.svg"),
  join(ROOT, "app/icon.svg"),
];

for (const target of targets) {
  copyFileSync(iconSource, target);
}

const publicDirection = join(ROOT, "public/design/logo/directions", sourceName);
copyFileSync(source, publicDirection);

execSync("node scripts/build/generate-pwa-icons.mjs", { stdio: "inherit", cwd: ROOT });

const updated = directions.map((entry) => ({
  ...entry,
  shipped: entry.id === id,
}));
writeFileSync(directionsPath, `${JSON.stringify(updated, null, 2)}\n`);

console.log(`Shipped ${id} → public/icon.svg, app/icon.svg, and PWA PNGs`);
