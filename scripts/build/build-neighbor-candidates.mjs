#!/usr/bin/env node
/**
 * Regenerates data/starter/<lang>-neighbor-candidates.json from the meaning-recall pool.
 * See docs/specs/service/broken-card-detection.md.
 *
 *   node scripts/build-neighbor-candidates.mjs [es|it]
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildNeighborCandidateIndex } from "../../lib/neighbor-candidates.mjs";
import { pathsFor, resolveLang } from "./starter-deck-lang.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { code: LANG } = resolveLang(process.argv[2]);
const paths = pathsFor(ROOT, LANG);

const build = async () => {
  const pool = JSON.parse(await readFile(paths.output, "utf8"));
  const lemmas = pool.cards.map((card) => card.lemma);
  const index = buildNeighborCandidateIndex(LANG, lemmas);
  const outPath = join(ROOT, "data", "starter", `${LANG}-neighbor-candidates.json`);

  await writeFile(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  const withCandidates = Object.keys(index.candidates).length;
  console.log(
    `wrote ${withCandidates} lemmas with neighbour candidates (tightened=${index.tightened}, pool=${lemmas.length}) → ${outPath}`,
  );
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
