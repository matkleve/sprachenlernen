#!/usr/bin/env node
/**
 * Export description snapshots from shipped pools. Contract:
 * docs/specs/service/app-texts.md
 *
 * Writes data/i18n/descriptions/en.json (source English) and optionally de.json
 * via --translate-de (uses Google Translate gtx client — dev/seed only).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cardDescriptionKey,
  descriptionFaceForTaskType,
  sentenceTextKey,
  sentenceTranslationKey,
  taskTypeFromTaskId,
} from "./description-keys.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "data/i18n/descriptions");

const STARTER_FILES = [
  "data/starter/es-meaning-recall.json",
  "data/starter/it-meaning-recall.json",
  "data/starter/es-form-recall.json",
  "data/starter/it-form-recall.json",
];

const DEMONSTRATION_FILES = [
  "data/demonstration-sentences/es.json",
  "data/demonstration-sentences/it.json",
];

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function collectFromStarter(path) {
  const deck = readJson(path);
  const entries = [];
  for (const card of deck.cards ?? []) {
    const taskType = taskTypeFromTaskId(card.taskId);
    const face = descriptionFaceForTaskType(taskType);
    const key = cardDescriptionKey(card.wordId, taskType, face);
    const text = face === "back" ? card.back : card.front;
    entries.push({ key, text, context: `${deck.language} ${taskType} ${face}` });
  }
  return entries;
}

function collectFromDemonstration(path) {
  const bank = readJson(path);
  const entries = [];
  for (const sentence of bank.sentences ?? []) {
    entries.push({
      key: sentenceTextKey(sentence.id),
      text: sentence.text,
      context: `demonstration target sentence ${sentence.id}`,
      sourceLang: path.includes("/es.") ? "es" : "it",
    });
    entries.push({
      key: sentenceTranslationKey(sentence.id),
      text: sentence.translation,
      context: `demonstration translation ${sentence.id}`,
      sourceLang: "en",
    });
  }
  return entries;
}

function buildEnglishCatalog() {
  const catalog = new Map();
  for (const file of STARTER_FILES) {
    for (const row of collectFromStarter(file)) {
      catalog.set(row.key, { text: row.text, context: row.context, sourceLang: "en" });
    }
  }
  for (const file of DEMONSTRATION_FILES) {
    for (const row of collectFromDemonstration(file)) {
      catalog.set(row.key, {
        text: row.text,
        context: row.context,
        sourceLang: row.sourceLang ?? "en",
      });
    }
  }
  return catalog;
}

async function translateEnToDe(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=de&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`translate failed: ${response.status}`);
  const payload = await response.json();
  const chunk = payload?.[0]?.[0]?.[0];
  return typeof chunk === "string" ? chunk : text;
}

async function buildGermanSnapshot(enSnapshot) {
  const uniqueEnglish = [...new Set(Object.values(enSnapshot))];
  const translationMap = new Map();
  const batchSize = 40;

  for (let i = 0; i < uniqueEnglish.length; i += batchSize) {
    const batch = uniqueEnglish.slice(i, i + batchSize);
    for (const english of batch) {
      if (translationMap.has(english)) continue;
      try {
        const german = await translateEnToDe(english);
        translationMap.set(english, german);
      } catch (error) {
        console.warn(`translate skip: ${english.slice(0, 40)}… (${error.message})`);
        translationMap.set(english, english);
      }
    }
    process.stdout.write(`\rTranslated ${Math.min(i + batchSize, uniqueEnglish.length)}/${uniqueEnglish.length}`);
  }
  process.stdout.write("\n");

  const deSnapshot = {};
  for (const [key, english] of Object.entries(enSnapshot)) {
    deSnapshot[key] = translationMap.get(english) ?? english;
  }
  return deSnapshot;
}

function writeSnapshot(locale, snapshot) {
  const sorted = Object.fromEntries(Object.entries(snapshot).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(OUT_DIR, `${locale}.json`), `${JSON.stringify(sorted, null, 2)}\n`);
}

async function main() {
  const translateDe = process.argv.includes("--translate-de");
  const catalog = buildEnglishCatalog();

  const enSnapshot = {};
  for (const [key, row] of catalog) {
    if (row.sourceLang === "en") {
      enSnapshot[key] = row.text;
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeSnapshot("en", enSnapshot);
  console.log(`Wrote ${Object.keys(enSnapshot).length} English description keys to en.json`);

  if (translateDe) {
    const deSnapshot = await buildGermanSnapshot(enSnapshot);
    writeSnapshot("de", deSnapshot);
    console.log(`Wrote ${Object.keys(deSnapshot).length} German description keys to de.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
