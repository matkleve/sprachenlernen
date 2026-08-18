#!/usr/bin/env node
/**
 * Fail when description snapshots contain repeated comma-separated gloss segments.
 * Contract: docs/specs/service/app-texts.md
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { hasDuplicateGlossSegments } from "./gloss-segments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "data/i18n/descriptions");

const failures = [];

for (const file of readdirSync(OUT_DIR).filter((name) => name.endsWith(".json"))) {
  const locale = file.replace(/\.json$/, "");
  const snapshot = JSON.parse(readFileSync(join(OUT_DIR, file), "utf8"));
  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value !== "string") continue;
    if (hasDuplicateGlossSegments(value)) {
      failures.push(`${locale}:${key} → ${value.slice(0, 80)}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Description snapshots with duplicate gloss segments: ${failures.length}`);
  for (const line of failures.slice(0, 20)) console.error(`  - ${line}`);
  if (failures.length > 20) {
    console.error(`  … and ${failures.length - 20} more`);
  }
  process.exit(1);
}

console.log("description snapshot gloss segments ok");
