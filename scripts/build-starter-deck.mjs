#!/usr/bin/env node
/**
 * Regenerates `data/starter/es-meaning-recall.json`.
 *
 * Lemma ranks come from summing OpenSubtitles form frequencies through the
 * generated lemma table. Glosses come from hand-checked overrides first, then
 * Kaikki.org (CC BY-SA 3.0). See docs/specs/service/starter-deck.md.
 *
 *   node scripts/build-starter-deck.mjs
 */

import { createReadStream } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = process.env.GLOSS_CACHE ?? join(ROOT, ".cache/gloss");
const POOL_SIZE = 500;

const KAIKKI = {
  url: "https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl",
  file: "kaikki-es.jsonl",
  licence: "CC BY-SA 3.0",
};

const paths = {
  frequency: join(ROOT, "data/frequency/es.txt"),
  lemmaTable: join(ROOT, "data/lemma/es.json"),
  overrides: join(ROOT, "data/starter/es-meaning-recall.overrides.json"),
  output: join(ROOT, "data/starter/es-meaning-recall.json"),
};

const readFormCounts = async () => {
  const text = await readFile(paths.frequency, "utf8");
  const counts = new Map();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const [form, rawCount] = trimmed.split(/\s+/);
    counts.set(form.toLowerCase(), Number(rawCount));
  }
  return counts;
};

/** @param {import("../lib/lemma-table.ts").LemmaTable} table */
const resolveLemma = (table, form) => {
  if (table.fused[form]) return null;
  const raw = table.forms[form];
  if (!raw?.length) return form;
  const first = raw[0];
  if (Array.isArray(first)) return first[0];
  return first.lemma;
};

/** @param {import("../lib/lemma-table.ts").LemmaTable} table */
const rankLemmas = (table, formCounts) => {
  const lemmaCounts = new Map();
  for (const [form, count] of formCounts) {
    const lemma = resolveLemma(table, form);
    if (!lemma) continue;
    lemmaCounts.set(lemma, (lemmaCounts.get(lemma) ?? 0) + count);
  }
  return [...lemmaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, POOL_SIZE)
    .map(([lemma]) => lemma);
};

const loadOverrides = async () => {
  try {
    await access(paths.overrides);
  } catch {
    return {};
  }
  return JSON.parse(await readFile(paths.overrides, "utf8"));
};

const ensureKaikkiCached = async () => {
  const path = join(CACHE, KAIKKI.file);
  try {
    await access(path);
    return path;
  } catch {
    /* not cached yet */
  }
  process.stdout.write(`  fetching ${KAIKKI.file} … `);
  const res = await fetch(KAIKKI.url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${KAIKKI.url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await mkdir(CACHE, { recursive: true });
  await writeFile(path, bytes);
  process.stdout.write(`${(bytes.length / 1e6).toFixed(1)} MB\n`);
  return path;
};

const loadKaikkiGlosses = async (lemmas) => {
  const need = new Set(lemmas);
  const glosses = new Map();
  const path = await ensureKaikkiCached();

  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const word = entry.word?.toLowerCase();
    if (!word || !need.has(word) || glosses.has(word)) continue;
    const gloss = entry.senses?.find((sense) => sense.glosses?.length)?.glosses?.[0];
    if (gloss) {
      glosses.set(word, gloss.replace(/\s+/g, " ").trim());
    }
    if (glosses.size === need.size) break;
  }

  return glosses;
};

const build = async () => {
  const [formCounts, table, overrides] = await Promise.all([
    readFormCounts(),
    readFile(paths.lemmaTable, "utf8").then((raw) => JSON.parse(raw)),
    loadOverrides(),
  ]);

  const lemmas = rankLemmas(table, formCounts);
  if (lemmas.length < POOL_SIZE) {
    throw new Error(`only ${lemmas.length} lemmas ranked — need ${POOL_SIZE}`);
  }

  const kaikki = await loadKaikkiGlosses(lemmas);
  const missing = [];

  const cards = lemmas.map((lemma, index) => {
    const back = overrides[lemma] ?? kaikki.get(lemma);
    if (!back) {
      missing.push(lemma);
      return null;
    }
    return {
      taskId: `es:${lemma}:meaning-recall`,
      wordId: `es:${lemma}`,
      lemma,
      front: lemma,
      back,
      frequencyRank: index + 1,
    };
  });

  if (missing.length > 0) {
    throw new Error(`missing glosses for: ${missing.join(", ")}`);
  }

  const deck = {
    language: "es",
    taskType: "meaning-recall",
    cards,
  };

  await mkdir(dirname(paths.output), { recursive: true });
  await writeFile(paths.output, `${JSON.stringify(deck, null, 2)}\n`);
  console.log(`wrote ${cards.length} cards → ${paths.output}`);
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
