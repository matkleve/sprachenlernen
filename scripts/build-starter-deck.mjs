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

/**
 * A dictionary gloss is not a card back. Kaikki ships the full sense line —
 * `dog (the species Canis familiaris …)`, or twelve comma-separated synonyms —
 * and a learner grading their own recall against that is grading against a
 * paragraph. Shaping is deliberately mechanical so it stays reviewable: drop
 * the apparatus, keep the first sense group, cap the synonym run.
 *
 * Rejected: truncating to N characters. It cuts mid-word and mid-sense, which
 * produces a back that is wrong rather than merely short.
 */
const MAX_SENSES = 3;
const MAX_GLOSS_CHARS = 60;

/**
 * Lemmas whose honest English gloss is the Spanish word itself live in
 * `es-meaning-recall.cognates.json`. Listed rather than detected, because "the
 * gloss equals the front" is otherwise exactly the signature of a gloss that
 * failed to resolve — the check below has to tell a true cognate from a broken
 * lookup, and only a human can. It is data so the script and the test that
 * enforces the same rule cannot drift apart.
 */

const KAIKKI = {
  url: "https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl",
  file: "kaikki-es.jsonl",
  licence: "CC BY-SA 3.0",
};

const paths = {
  frequency: join(ROOT, "data/frequency/es.txt"),
  lemmaTable: join(ROOT, "data/lemma/es.json"),
  overrides: join(ROOT, "data/starter/es-meaning-recall.overrides.json"),
  exclusions: join(ROOT, "data/starter/es-meaning-recall.exclusions.json"),
  cognates: join(ROOT, "data/starter/es-meaning-recall.cognates.json"),
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

/**
 * Excluded lemmas are dropped before the cap, not after, so the pool always
 * holds POOL_SIZE cards and simply reaches one rank deeper for each one it
 * skips. Dropping after the slice would silently ship a 497-card "500".
 *
 * @param {import("../lib/lemma-table.ts").LemmaTable} table
 */
const rankLemmas = (table, formCounts, excluded) => {
  const lemmaCounts = new Map();
  for (const [form, count] of formCounts) {
    const lemma = resolveLemma(table, form);
    if (!lemma) continue;
    lemmaCounts.set(lemma, (lemmaCounts.get(lemma) ?? 0) + count);
  }
  return [...lemmaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([lemma]) => lemma)
    .filter((lemma) => !excluded.has(lemma))
    .slice(0, POOL_SIZE);
};

const loadJsonIfPresent = async (path) => {
  try {
    await access(path);
  } catch {
    return {};
  }
  return JSON.parse(await readFile(path, "utf8"));
};

/** Balanced strip, so a nested `(… (…) …)` does not leave a stray tail. */
const stripBracketed = (text, open, close) => {
  let out = "";
  let depth = 0;
  for (const character of text) {
    if (character === open) depth += 1;
    else if (character === close) depth = Math.max(0, depth - 1);
    else if (depth === 0) out += character;
  }
  return out;
};

const shapeGloss = (raw) => {
  const withoutApparatus = stripBracketed(stripBracketed(raw, "(", ")"), "[", "]");
  const firstSenseGroup = withoutApparatus.split(";")[0];
  return firstSenseGroup
    .split(",")
    .map((sense) => sense.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, MAX_SENSES)
    .join(", ");
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
  const [formCounts, table, overrides, exclusions, cognateList] = await Promise.all([
    readFormCounts(),
    readFile(paths.lemmaTable, "utf8").then((raw) => JSON.parse(raw)),
    loadJsonIfPresent(paths.overrides),
    loadJsonIfPresent(paths.exclusions),
    loadJsonIfPresent(paths.cognates),
  ]);
  const cognates = new Set(Array.isArray(cognateList) ? cognateList : []);

  const lemmas = rankLemmas(table, formCounts, new Set(Object.keys(exclusions)));
  if (lemmas.length < POOL_SIZE) {
    throw new Error(`only ${lemmas.length} lemmas ranked — need ${POOL_SIZE}`);
  }

  const kaikki = await loadKaikkiGlosses(lemmas);
  const missing = [];
  const unusable = [];

  const cards = lemmas.map((lemma, index) => {
    // Overrides are hand-checked and ship verbatim; only machine glosses are
    // shaped, because shaping a human's answer would undo the review.
    const override = overrides[lemma];
    const raw = override ?? kaikki.get(lemma);
    if (!raw) {
      missing.push(lemma);
      return null;
    }

    const back = override ?? shapeGloss(raw);
    if (back === "" || back.length > MAX_GLOSS_CHARS) {
      unusable.push(`${lemma}: ${JSON.stringify(back)} (needs an override)`);
      return null;
    }
    if (back === lemma && !cognates.has(lemma)) {
      unusable.push(`${lemma}: gloss equals the front (override it, or list it as a cognate)`);
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
  if (unusable.length > 0) {
    throw new Error(`unusable glosses:\n  ${unusable.join("\n  ")}`);
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
