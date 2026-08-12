#!/usr/bin/env node
/**
 * Expands companion files so `build-starter-deck.mjs` can reach POOL_SIZE.
 * Run before building stage 2: `node scripts/expand-pool-companions.mjs [es|it]`
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { POOL_SIZE, pathsFor, resolveLang } from "./starter-deck-lang.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { code: LANG, config: LANG_CONFIG } = resolveLang(process.argv[2]);
const paths = pathsFor(ROOT, LANG);

const loadJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const saveJson = async (path, value) =>
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const META =
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

/** First translation-like clause when the shaped gloss is too long. */
const shortenForOverride = (shaped) => {
  for (const part of shaped.split(/[,;]/)) {
    const candidate = part.trim();
    if (candidate.length > 0 && candidate.length <= 60 && !META.test(candidate)) {
      return candidate;
    }
  }
  const words = shaped.split(/\s+/);
  let out = "";
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > 60) break;
    out = next;
  }
  return out.length > 0 && out.length <= 60 ? out : null;
};

const runAnalyze = () => {
  const result = spawnSync("node", ["scripts/analyze-pool-glosses.mjs", LANG], {
    cwd: ROOT,
    env: { ...process.env, POOL_SIZE: String(POOL_SIZE) },
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error("analyze failed");
  }
  return result.stdout;
};

const parseAnalyze = (stdout) => {
  const missing = [];
  const unusable = [];
  for (const line of stdout.split("\n")) {
    const missingMatch = line.match(/^missing \d+: (.*)$/);
    if (missingMatch?.[1]) {
      missing.push(...missingMatch[1].split(", ").filter(Boolean));
      continue;
    }
    const unusableMatch = line.match(/^\s+(\S+) \((cognate|meta|long\/empty)\): (.*)$/);
    if (unusableMatch) {
      unusable.push({
        lemma: unusableMatch[1],
        reason: unusableMatch[2],
        back: unusableMatch[3].replace(/^"|"$/g, ""),
      });
    }
  }
  return { missing, unusable };
};

const isProperNameMeta = (back) =>
  /\b(given name|surname)\b/i.test(back) ||
  /^a (male|female) given name/i.test(back) ||
  /^alternative form of/i.test(back);

const isInflectedMeta = (back) =>
  /\b(first|second|third)-person\b/.test(back) ||
  /\b(preterite|imperative|subjunctive|conditional|indicative|participle)\b.*\bof\b/i.test(back) ||
  /\b(feminine|masculine|plural) (of|singular|plural)\b/i.test(back) ||
  /^infinitive of\b/i.test(back) ||
  /^accented form of\b/i.test(back) ||
  /^diminutive of\b/i.test(back) ||
  /^plural of\b/i.test(back);

const exclusionReason = {
  missing:
    "proper name or English fragment — from the subtitle corpus, not vocabulary",
  properName: "proper name — not vocabulary",
  inflected: "inflected form — the lemma form belongs in the pool at its own rank",
};

let overrides = await loadJson(paths.overrides);
let exclusions = await loadJson(paths.exclusions);
let cognates = await loadJson(paths.cognates);
const cognateSet = new Set(cognates);

let iteration = 0;
while (iteration < 20) {
  iteration += 1;
  const { missing, unusable } = parseAnalyze(runAnalyze());
  if (missing.length === 0 && unusable.length === 0) {
    console.log(
      `[${LANG}] companions ready for pool size ${POOL_SIZE} after ${iteration - 1} expansion(s)`,
    );
    break;
  }

  console.log(
    `[${LANG}] iteration ${iteration}: ${missing.length} missing, ${unusable.length} unusable`,
  );

  for (const lemma of missing) {
    exclusions[lemma] = exclusionReason.missing.replace(
      "vocabulary",
      `${LANG_CONFIG.label} vocabulary`,
    );
  }

  for (const row of unusable) {
    if (row.reason === "cognate") {
      if (!cognateSet.has(row.lemma)) {
        cognates.push(row.lemma);
        cognateSet.add(row.lemma);
      }
      continue;
    }

    if (row.reason === "meta") {
      if (isProperNameMeta(row.back)) {
        exclusions[row.lemma] = exclusionReason.properName.replace(
          "vocabulary",
          `${LANG_CONFIG.label} vocabulary`,
        );
      } else if (isInflectedMeta(row.back)) {
        exclusions[row.lemma] = exclusionReason.inflected;
      } else {
        const short = shortenForOverride(shapeGloss(row.back));
        if (short) overrides[row.lemma] = short;
        else exclusions[row.lemma] = `unusable gloss — ${row.back.slice(0, 80)}`;
      }
      continue;
    }

    const shaped = shapeGloss(row.back);
    const short = shortenForOverride(shaped);
    if (short && short !== row.lemma && !META.test(short)) {
      overrides[row.lemma] = short;
    } else {
      exclusions[row.lemma] =
        "gloss too long after shaping — needs a hand-checked override before it can ship";
    }
  }

  cognates.sort();
  await Promise.all([
    saveJson(paths.overrides, overrides),
    saveJson(paths.exclusions, exclusions),
    saveJson(paths.cognates, cognates),
  ]);
}

if (iteration >= 20) {
  throw new Error("expand-pool-companions did not converge — inspect analyze output");
}
