#!/usr/bin/env node
/**
 * Build-time generator for `data/lemma/<code>.json`.
 *
 * This is the morphological analyser, and it runs **here** rather than in the
 * app. `lib/lexicon.ts` only ever reads the table this produces — see
 * `docs/specs/service/lexicon.md`. That split is what makes resolution offline,
 * deterministic and identical on every device, and it is why adding a language
 * means finding data rather than writing code.
 *
 *   node scripts/build-lemma-tables.mjs          # every language
 *   node scripts/build-lemma-tables.mjs it       # one
 *
 * Sources are downloaded into a cache directory (default `.cache/morph/`,
 * override with `MORPH_CACHE`). They are large and deliberately **not**
 * committed; the generated tables are, so a normal checkout needs no network
 * and gets byte-identical data. What each source is and why two different
 * formats are read at all: `scripts/lemma/languages.mjs`.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { assembleTable } from "./lemma/assemble.mjs";
import { fetchCached, readFrequency } from "./lemma/io.mjs";
import { LANGUAGES } from "./lemma/languages.mjs";
import { readMorphit } from "./lemma/morphit.mjs";
import { readTreebank } from "./lemma/treebank.mjs";
import { readUnimorph } from "./lemma/unimorph.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = process.env.MORPH_CACHE ?? join(ROOT, ".cache/morph");

/**
 * How many of the frequency list's forms seed the table. Every **lemma** these
 * reach then contributes its whole paradigm, so the table comes out an order of
 * magnitude larger — which is the point: UC-041 needs a word's forms to resolve
 * even when a particular form is far too rare to be listed.
 */
const SEED_FORMS = 5000;

const fetchInputs = async (code, config) => {
  const source = config.paradigms;
  const raw = await fetchCached(CACHE, source.url, source.file, source.encoding);
  const paradigms = source.format === "morphit" ? readMorphit(raw) : readUnimorph(raw);

  const ud = { byForm: new Map(), fused: new Map() };
  for (const tb of config.treebanks) {
    readTreebank(await fetchCached(CACHE, tb.url, tb.file, "utf8"), ud);
  }

  const seeds = readFrequency(
    await readFile(join(ROOT, `data/frequency/${code}.txt`), "utf8"),
  ).slice(0, SEED_FORMS);

  return { paradigms, ud, seeds, seedForms: SEED_FORMS };
};

const build = async (code) => {
  const config = LANGUAGES[code];
  if (!config) throw new Error(`unknown language: ${code}`);
  console.log(`\n${config.name} (${code})`);

  const inputs = await fetchInputs(code, config);
  const table = assembleTable(code, config, inputs);

  const path = join(ROOT, `data/lemma/${code}.json`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(table)}\n`);

  const forms = Object.keys(table.forms).length;
  const lemmas = Object.keys(table.lemmas).length;
  const fused = Object.keys(table.fused).length;
  console.log(
    `  ${forms} forms · ${lemmas} described lemmas · ${fused} fused · ` +
      `seed coverage ${(table.seedCoverage * 100).toFixed(1)}% · ` +
      `${table.verbLemmas} verbs, ${(table.verbParadigmsComplete * 100).toFixed(0)}% with a full paradigm`,
  );
};

const requested = process.argv.slice(2);
for (const code of requested.length > 0 ? requested : Object.keys(LANGUAGES)) {
  await build(code);
}
