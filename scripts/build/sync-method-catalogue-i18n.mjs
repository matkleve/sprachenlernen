/**
 * Sync method catalogue copy into messages/en.json and messages/de.json.
 * English source: data/methods/*.json (canonical catalogue).
 * German source: data/i18n/method-catalogue/de.json (authored translations).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(root, "..");

function loadCatalogueEntries() {
  const methodsDir = path.join(repoRoot, "data/methods");
  const entries = [];
  for (const file of readdirSync(methodsDir)
    .filter((name) => name.endsWith(".json"))
    .sort()) {
    const data = JSON.parse(readFileSync(path.join(methodsDir, file), "utf8"));
    for (const entry of data.entries ?? []) {
      entries.push(entry);
    }
  }
  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

function buildEntriesBlock(entries) {
  const block = {};
  for (const entry of entries) {
    block[entry.id] = {
      name: entry.name,
      summary: entry.summary,
      trains: entry.trains,
      doesNotDo: entry.doesNotDo,
    };
  }
  return block;
}

function mergeEntries(messages, entriesBlock) {
  return {
    ...messages,
    methodMenu: {
      ...messages.methodMenu,
      entries: entriesBlock,
    },
  };
}

const entries = loadCatalogueEntries();
const enBlock = buildEntriesBlock(entries);

const deSourcePath = path.join(repoRoot, "data/i18n/method-catalogue/de.json");
const deSource = JSON.parse(readFileSync(deSourcePath, "utf8"));

const missingDe = entries.filter((entry) => !deSource[entry.id]);
if (missingDe.length > 0) {
  console.error("Missing German translations for:");
  for (const entry of missingDe) console.error(`  - ${entry.id}`);
  process.exit(1);
}

const deBlock = {};
for (const entry of entries) {
  const row = deSource[entry.id];
  for (const field of ["name", "summary", "trains", "doesNotDo"]) {
    if (!row[field]) {
      console.error(`Missing de.${entry.id}.${field}`);
      process.exit(1);
    }
  }
  deBlock[entry.id] = row;
}

const enPath = path.join(repoRoot, "messages/en.json");
const dePath = path.join(repoRoot, "messages/de.json");

const en = JSON.parse(readFileSync(enPath, "utf8"));
const de = JSON.parse(readFileSync(dePath, "utf8"));

writeFileSync(enPath, `${JSON.stringify(mergeEntries(en, enBlock), null, 2)}\n`);
writeFileSync(dePath, `${JSON.stringify(mergeEntries(de, deBlock), null, 2)}\n`);

console.log(`Synced ${entries.length} method catalogue entries into messages/en.json and messages/de.json`);
