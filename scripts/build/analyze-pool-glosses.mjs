#!/usr/bin/env node
/** Report gloss gaps for a target pool size. Usage: node scripts/analyze-pool-glosses.mjs [es|it] */
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { POOL_SIZE, pathsFor, resolveLang } from "./starter-deck-lang.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, ".cache/gloss");
const { code: LANG, config: LANG_CONFIG } = resolveLang(process.argv[2]);
const paths = pathsFor(ROOT, LANG);

const MAX_GLOSS_CHARS = 60;
const METALINGUISTIC =
  /\b(first|second|third)-person\b|\b(singular|plural)\b.*\bof\b|^Senses relating|\bform of\b|\bapocopic\b|^Used\b|\bpast participle of\b|\bfeminine of\b|\bdiminutive of\b|\bletter of the\b|\ba surname\b|\bgiven name\b/i;

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

const loadKaikkiGlosses = async (lemmas) => {
  const need = new Set(lemmas);
  const glosses = new Map();
  const kaikkiPath = join(CACHE, LANG_CONFIG.kaikki.file);
  const rl = createInterface({ input: createReadStream(kaikkiPath), crlfDelay: Infinity });
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
    if (gloss) glosses.set(word, gloss.replace(/\s+/g, " ").trim());
    if (glosses.size === need.size) break;
  }
  return glosses;
};

const [formCounts, table, overrides, exclusions, cognateList] = await Promise.all([
  readFormCounts(),
  readFile(paths.lemmaTable, "utf8").then((raw) => JSON.parse(raw)),
  readFile(paths.overrides, "utf8").then((raw) => JSON.parse(raw)),
  readFile(paths.exclusions, "utf8").then((raw) => JSON.parse(raw)),
  readFile(paths.cognates, "utf8").then((raw) => JSON.parse(raw)),
]);

const cognates = new Set(cognateList);
const lemmas = rankLemmas(table, formCounts, new Set(Object.keys(exclusions)));
const kaikki = await loadKaikkiGlosses(lemmas);

const missing = [];
const unusable = [];

for (const lemma of lemmas) {
  const override = overrides[lemma];
  const raw = override ?? kaikki.get(lemma);
  if (!raw) {
    missing.push(lemma);
    continue;
  }
  const back = override ?? shapeGloss(raw);
  if (back === "" || back.length > MAX_GLOSS_CHARS) {
    unusable.push({ lemma, reason: "long/empty", back });
    continue;
  }
  if (back === lemma && !cognates.has(lemma)) {
    unusable.push({ lemma, reason: "cognate", back });
    continue;
  }
  if (override === undefined && METALINGUISTIC.test(back)) {
    unusable.push({ lemma, reason: "meta", back });
  }
}

console.log(`[${LANG}] pool size ${POOL_SIZE}, ranked ${lemmas.length}`);
console.log(`missing ${missing.length}:`, missing.join(", "));
console.log(`unusable ${unusable.length}:`);
for (const row of unusable) {
  console.log(`  ${row.lemma} (${row.reason}): ${JSON.stringify(row.back)}`);
}
