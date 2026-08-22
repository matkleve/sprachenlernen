#!/usr/bin/env node
/**
 * Fetch licence-cleared Wikinews articles into data/content/{lang}.json.
 * Contract: docs/specs/service/content-ingestion.md (T-CI2)
 *
 * Usage:
 *   node --experimental-strip-types scripts/ingest-wikinews.mjs --language es --query elecciones --limit 1
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  isAllowlistedWikinewsLanguage,
  normalizeWikinewsPageToSource,
  parseWikinewsParseResponse,
  parseWikinewsSearchResponse,
  wikinewsParseUrl,
  wikinewsSearchUrl,
} from "../../lib/wikinews-ingest.ts";

const args = process.argv.slice(2);
const language = args.includes("--language")
  ? args[args.indexOf("--language") + 1]
  : "es";
const query = args.includes("--query") ? args[args.indexOf("--query") + 1] : "noticias";
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 1;
const dryRun = args.includes("--dry-run");

if (!isAllowlistedWikinewsLanguage(language)) {
  console.error(`Language not allowlisted for Wikinews ingest: ${language}`);
  process.exit(1);
}

const fetchedAt = new Date().toISOString();
const searchResponse = await fetch(wikinewsSearchUrl(language, query, limit));
if (!searchResponse.ok) {
  console.error(`Wikinews search failed: ${searchResponse.status}`);
  process.exit(1);
}

const hits = parseWikinewsSearchResponse(await searchResponse.json());
if (hits.length === 0) {
  console.error("No Wikinews hits returned.");
  process.exit(1);
}

const ingested = [];
for (const hit of hits) {
  const parseResponse = await fetch(wikinewsParseUrl(language, hit.title));
  if (!parseResponse.ok) {
    console.error(`Parse failed for ${hit.title}: ${parseResponse.status}`);
    continue;
  }
  const page = parseWikinewsParseResponse(await parseResponse.json(), language);
  if (!page) {
    console.error(`Parse payload invalid for ${hit.title}`);
    continue;
  }
  const source = normalizeWikinewsPageToSource(page, language, fetchedAt);
  if (!source) {
    console.error(`Empty body after normalize for ${hit.title}`);
    continue;
  }
  ingested.push(source);
}

if (ingested.length === 0) {
  console.error("No sources ingested.");
  process.exit(1);
}

const contentPath = join(process.cwd(), `data/content/${language}.json`);
const existing = JSON.parse(readFileSync(contentPath, "utf8"));
const withoutWikinews = existing.filter(
  (row) => !String(row.id).startsWith(`wikinews-${language}-`),
);
const withoutReplacedFixture =
  language === "es"
    ? withoutWikinews.filter((row) => row.id !== "es-catalogue-chile")
    : withoutWikinews;

const serialize = (source) => ({
  id: source.id,
  languageCode: source.languageCode,
  kind: source.kind,
  title: source.title,
  origin: source.origin,
  body: source.body,
  tags: source.tags,
  sourceUrl: source.sourceUrl,
  addedAt: source.addedAt,
  licence: source.licence,
});

const next = [...withoutReplacedFixture, ...ingested.map(serialize)];

if (dryRun) {
  console.log(JSON.stringify(next, null, 2));
  process.exit(0);
}

writeFileSync(contentPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${ingested.length} Wikinews source(s) to ${contentPath}: ${ingested
    .map((source) => source.id)
    .join(", ")}`,
);
