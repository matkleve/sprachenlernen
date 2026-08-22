#!/usr/bin/env node
/**
 * Gate: committed neighbour-candidate sidecars match the pools.
 * See docs/specs/service/broken-card-detection.md.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildNeighborCandidateIndex } from "../../lib/neighbor-candidates.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LANGS = ["es", "it"];

let failed = false;

for (const lang of LANGS) {
  const poolPath = join(ROOT, "data", "starter", `${lang}-meaning-recall.json`);
  const sidecarPath = join(ROOT, "data", "starter", `${lang}-neighbor-candidates.json`);

  const pool = JSON.parse(await readFile(poolPath, "utf8"));
  const committed = JSON.parse(await readFile(sidecarPath, "utf8"));
  const expected = buildNeighborCandidateIndex(lang, pool.cards.map((card) => card.lemma));

  if (JSON.stringify(committed) !== JSON.stringify(expected)) {
    console.error(`✗ ${lang}: ${sidecarPath} is stale — run: node scripts/build/build-neighbor-candidates.mjs ${lang}`);
    failed = true;
    continue;
  }

  const count = Object.keys(expected.candidates).length;
  const ratio = count / pool.cards.length;
  console.log(
    `✓ ${lang}: ${count} lemmas with candidates (${(ratio * 100).toFixed(1)}%, tightened=${expected.tightened})`,
  );
}

if (failed) process.exit(1);
