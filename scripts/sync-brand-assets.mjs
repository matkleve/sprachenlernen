#!/usr/bin/env node
/**
 * Promote a chosen logo direction to the shipped PWA / favicon assets.
 * Usage: node scripts/sync-brand-assets.mjs <direction-id>
 * Example: node scripts/sync-brand-assets.mjs warm-scholar-bars
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const directionsPath = join(ROOT, "data/brand/logo-directions.json");
const directions = JSON.parse(readFileSync(directionsPath, "utf8"));

const id = process.argv[2];
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
if (!existsSync(source)) {
  console.error(`Missing source: ${source}`);
  process.exit(1);
}

const targets = [
  join(ROOT, "public/icon.svg"),
  join(ROOT, "app/icon.svg"),
];

for (const target of targets) {
  copyFileSync(source, target);
}

const publicDirection = join(ROOT, "public/design/logo/directions", sourceName);
copyFileSync(source, publicDirection);

const updated = directions.map((entry) => ({
  ...entry,
  shipped: entry.id === id,
}));
writeFileSync(directionsPath, `${JSON.stringify(updated, null, 2)}\n`);

console.log(`Shipped ${id} → public/icon.svg, app/icon.svg`);
