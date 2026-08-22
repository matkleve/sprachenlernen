#!/usr/bin/env node
/**
 * One-shot repair for description snapshots with repeated gloss segments.
 * Safe to re-run — idempotent.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { dedupeGlossSegments } from "./gloss-segments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "data/i18n/descriptions");

let changedKeys = 0;

for (const file of readdirSync(OUT_DIR).filter((name) => name.endsWith(".json"))) {
  const path = join(OUT_DIR, file);
  const snapshot = JSON.parse(readFileSync(path, "utf8"));
  let fileChanged = false;

  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value !== "string") continue;
    const deduped = dedupeGlossSegments(value);
    if (deduped !== value) {
      snapshot[key] = deduped;
      changedKeys += 1;
      fileChanged = true;
    }
  }

  if (fileChanged) {
    const sorted = Object.fromEntries(Object.entries(snapshot).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(path, `${JSON.stringify(sorted, null, 2)}\n`);
    console.log(`Updated ${file} (${changedKeys} keys so far)`);
  }
}

console.log(`Deduped ${changedKeys} description keys`);
