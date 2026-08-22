#!/usr/bin/env node
/**
 * Validate and merge partner-feed fixtures into data/content/{lang}.json.
 * Contract: docs/specs/service/content-ingestion.md (T-CI8)
 *
 * Production RSS ingest waits on TOS sign-off — this script only merges
 * checked fixture rows from data/partner-feeds/.
 *
 * Usage:
 *   node --experimental-strip-types scripts/ingest-partner-feed.mjs --language es
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  isRegisteredPartnerId,
  normalizePartnerFeedToSource,
  PARTNER_FEED_REGISTRY,
} from "../lib/partner-feed-ingest.ts";

const args = process.argv.slice(2);
const language = args.includes("--language")
  ? args[args.indexOf("--language") + 1]
  : "es";
const dryRun = args.includes("--dry-run");

const fixtureDir = join(process.cwd(), "data/partner-feeds");
const fixturePath = join(fixtureDir, `${language}.json`);

if (!existsSync(fixturePath)) {
  console.error(`No partner fixture at ${fixturePath}`);
  process.exit(1);
}

const fetchedAt = new Date().toISOString();
const fixtureRows = JSON.parse(readFileSync(fixturePath, "utf8"));
if (!Array.isArray(fixtureRows)) {
  console.error("Partner fixture must be a JSON array.");
  process.exit(1);
}

const ingested = [];
for (const [index, row] of fixtureRows.entries()) {
  if (!isRegisteredPartnerId(row.partnerId)) {
    console.error(`Row ${index}: unknown partnerId ${row.partnerId}`);
    continue;
  }
  const config = PARTNER_FEED_REGISTRY[row.partnerId];
  console.log(
    `Partner ${config.displayName} — TOS ${config.tosUrl} (reviewed ${config.lastReviewedAt})`,
  );
  const source = normalizePartnerFeedToSource(row, fetchedAt);
  if (!source) {
    console.error(`Row ${index}: empty body/transcript`);
    continue;
  }
  ingested.push(source);
}

if (ingested.length === 0) {
  console.error("No partner sources ingested.");
  process.exit(1);
}

const contentPath = join(process.cwd(), `data/content/${language}.json`);
const existing = JSON.parse(readFileSync(contentPath, "utf8"));
const ingestedIds = new Set(ingested.map((source) => source.id));
const withoutPartners = existing.filter(
  (row) => !String(row.id).startsWith("partner-") || ingestedIds.has(row.id),
);
const merged = [...withoutPartners];
for (const source of ingested) {
  const index = merged.findIndex((row) => row.id === source.id);
  if (index >= 0) merged[index] = source;
  else merged.push(source);
}

if (dryRun) {
  console.log(JSON.stringify(ingested, null, 2));
  process.exit(0);
}

writeFileSync(contentPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log(`Merged ${ingested.length} partner source(s) into ${contentPath}`);
