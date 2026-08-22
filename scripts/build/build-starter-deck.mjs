#!/usr/bin/env node
/**
 * Regenerates `data/starter/<lang>-meaning-recall.json`.
 *
 *   node scripts/build-starter-deck.mjs [es|it]
 */

import { createReadStream } from "node:fs";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { POOL_SIZE, pathsFor, resolveLang } from "./starter-deck-lang.mjs";
import { cardDescriptionKey } from "./description-keys.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = process.env.GLOSS_CACHE ?? join(ROOT, ".cache/gloss");
const { code: LANG, config: LANG_CONFIG } = resolveLang(process.argv[2]);
const paths = pathsFor(ROOT, LANG);
const KAIKKI = LANG_CONFIG.kaikki;

const MAX_GLOSS_CHARS = 60;
const METALINGUISTIC =
  /\b(first|second|third)-person\b|\b(singular|plural)\b.*\bof\b|^Senses relating|\bform of\b|\bapocopic\b|^Used\b|\bpast participle of\b|\bfeminine of\b|\bdiminutive of\b|\bletter of the\b|\ba surname\b|\bgiven name\b/i;

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

const resolveLemma = (table, form) => {
  if (table.fused?.[form]) return null;
  const raw = table.forms[form];
  if (!raw?.length) return form;
  const first = raw[0];
  if (Array.isArray(first)) return first[0];
  return first.lemma;
};

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
    if (override === undefined && METALINGUISTIC.test(back)) {
      unusable.push(`${lemma}: ${JSON.stringify(back)} (grammar note, not a translation)`);
      return null;
    }

    return {
      taskId: `${LANG}:${lemma}:meaning-recall`,
      wordId: `${LANG}:${lemma}`,
      lemma,
      front: lemma,
      descriptionKey: cardDescriptionKey(`${LANG}:${lemma}`, "meaning-recall", "back"),
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
    language: LANG,
    taskType: "meaning-recall",
    cards,
  };

  await mkdir(dirname(paths.output), { recursive: true });
  await writeFile(paths.output, `${JSON.stringify(deck, null, 2)}\n`);

  const fromOverride = cards.filter((card) => overrides[card.lemma] !== undefined).length;
  console.log(
    `wrote ${cards.length} ${LANG} cards → ${paths.output}\n` +
      `  ${fromOverride} hand-checked, ${cards.length - fromOverride} from ${KAIKKI.file} (${KAIKKI.licence})`,
  );
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
