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
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = process.env.GLOSS_CACHE ?? join(ROOT, ".cache/gloss");
const POOL_SIZE = Number(process.env.POOL_SIZE ?? 2000);

/**
 * A dictionary gloss is not a card back: Kaikki ships the full sense line,
 * `dog (the species Canis familiaris …)`, and a learner grading recall against
 * that is grading against a paragraph. Shaping removes the **apparatus** — the
 * bracketed elaboration, which is always secondary to the gloss it follows.
 *
 * It deliberately does not choose between senses. An earlier version kept the
 * first `;` group and capped the synonym run at three, and that silently
 * shipped `policía` as "Civility, polity, public order" — one position short of
 * "police" — and `gran` as "apocopic form of grande", dropping the "great,
 * grand" that followed. Kaikki does not order senses by usefulness, so any
 * positional rule throws away the right answer sooner or later, and does it
 * invisibly. Anything still too long after the apparatus goes is a human's
 * problem, and the build says so.
 *
 * Rejected: truncating to N characters. It cuts mid-word and mid-sense, which
 * produces a back that is wrong rather than merely short.
 */
const MAX_GLOSS_CHARS = 60;

/**
 * Wiktionary answers "what is this word" as often as "what does it mean", and
 * an inflection note or a sense-group header is a fluent-looking gloss that
 * teaches nothing — `venir` arrived as "Senses relating to literal movement."
 * Length and emptiness cannot catch these, so they are matched and rejected.
 */
const METALINGUISTIC =
  /\b(first|second|third)-person\b|\b(singular|plural)\b.*\bof\b|^Senses relating|\bform of\b|\bapocopic\b|^Used\b|\bpast participle of\b|\bfeminine of\b|\bdiminutive of\b|\bletter of the\b|\ba surname\b|\bgiven name\b/i;

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

const loadJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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

const shapeGloss = (raw) =>
  stripBracketed(stripBracketed(raw, "(", ")"), "[", "]")
    .replace(/\s+/g, " ")
    .replace(/\s+([,;])/g, "$1")
    .replace(/[\s;,]+$/, "")
    .trim();

/**
 * The cache is trusted as-is, and a cache is not evidence of a fetch — it is
 * whatever is sitting at that path. A partial one mostly fails loudly, because
 * a lemma with no entry reaches the `missing glosses for:` throw; but every gap
 * an override happens to cover passes silently. So the run says where its
 * glosses came from, and a cached run says so out loud.
 */
const ensureKaikkiCached = async () => {
  const path = join(CACHE, KAIKKI.file);
  try {
    await access(path);
    const { size } = await stat(path);
    process.stdout.write(
      `  using cached ${KAIKKI.file} (${(size / 1e6).toFixed(1)} MB) — delete it to refetch\n`,
    );
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
    loadJson(paths.overrides),
    loadJson(paths.exclusions),
    loadJson(paths.cognates),
  ]);
  // Both companion files fail *closed*. Written in the wrong shape — an array
  // where an object belongs, which is what the sibling file next to it looks
  // like — `Object.keys` would quietly yield indices and exclude nothing, and
  // the build would print "wrote 500 cards" over a pool it never filtered.
  if (!isPlainObject(exclusions)) {
    throw new Error(`${paths.exclusions} must be a JSON object of lemma → reason`);
  }
  if (!Array.isArray(cognateList)) {
    throw new Error(`${paths.cognates} must be a JSON array of lemmas`);
  }
  const cognates = new Set(cognateList);

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
      unusable.push(`${lemma}: ${JSON.stringify(back)} (too long or empty — needs an override)`);
      return null;
    }
    if (back === lemma && !cognates.has(lemma)) {
      unusable.push(`${lemma}: gloss equals the front (override it, or list it as a cognate)`);
      return null;
    }
    // Overrides are exempt: a human writing "mine (fem.)" has already decided
    // that the note is the gloss.
    if (override === undefined && METALINGUISTIC.test(back)) {
      unusable.push(`${lemma}: ${JSON.stringify(back)} (grammar note, not a translation)`);
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

  const fromOverride = cards.filter((card) => overrides[card.lemma] !== undefined).length;
  console.log(
    `wrote ${cards.length} cards → ${paths.output}\n` +
      `  ${fromOverride} hand-checked, ${cards.length - fromOverride} from ${KAIKKI.file} (${KAIKKI.licence})`,
  );
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
