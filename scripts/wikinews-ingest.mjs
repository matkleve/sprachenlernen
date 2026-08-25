/**
 * Fetch recent Wikinews articles into data/content/{lang}.json.
 * Contract: docs/specs/service/content-ingestion.md (T-CI2)
 *
 * Usage:
 *   node scripts/wikinews-ingest.mjs es 5
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WIKINEWS = {
  es: { apiOrigin: "https://es.wikinews.org", languageCode: "es" },
  en: { apiOrigin: "https://en.wikinews.org", languageCode: "en" },
};

function wikitextToPlainBody(wikitext) {
  let text = wikitext;
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(/<ref[\s\S]*?<\/ref>/gi, " ");
  text = text.replace(/\[\[(?:Category|Categoría|Archivo|File):[^\]]+\]\]/gi, " ");
  text = text.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, "$1");
  text = text.replace(/\{\{[\s\S]*?\}\}/g, " ");
  text = text.replace(/^=+\s*(.*?)\s*=+$/gm, "$1");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

async function searchTitles(languageCode, limit) {
  const origin = WIKINEWS[languageCode].apiOrigin;
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srnamespace: "0",
    srsearch: "noticias",
    srlimit: String(limit),
    format: "json",
  });
  const response = await fetch(`${origin}/w/api.php?${params.toString()}`);
  const payload = await response.json();
  const hits = payload?.query?.search ?? [];
  return hits
    .filter((hit) => typeof hit.title === "string")
    .map((hit) => ({ pageid: hit.pageid, title: hit.title }));
}

async function fetchPage(languageCode, title) {
  const origin = WIKINEWS[languageCode].apiOrigin;
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "wikitext",
    format: "json",
  });
  const response = await fetch(`${origin}/w/api.php?${params.toString()}`);
  const payload = await response.json();
  const parse = payload?.parse;
  if (!parse?.pageid || !parse?.title || !parse?.wikitext?.["*"]) return null;
  const canonicalUrl =
    typeof parse.canonicalurl === "string"
      ? parse.canonicalurl
      : `${origin}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  return {
    pageid: parse.pageid,
    title: parse.title,
    wikitext: parse.wikitext["*"],
    canonicalUrl,
  };
}

function toSource(page, languageCode, fetchedAt) {
  const body = wikitextToPlainBody(page.wikitext);
  if (!body) return null;
  return {
    id: `wikinews-${languageCode}-${page.pageid}`,
    languageCode,
    kind: "text",
    title: page.title,
    origin: "catalogue",
    body,
    tags: ["news"],
    world: "politics",
    sourceUrl: page.canonicalUrl,
    addedAt: fetchedAt,
    licence: {
      kind: "cc-by",
      attribution: "Wikinews contributors",
      sourceUrl: page.canonicalUrl,
      fetchedAt,
    },
  };
}

const languageCode = process.argv[2] ?? "es";
const limit = Number(process.argv[3] ?? 5);

if (!WIKINEWS[languageCode]) {
  console.error(`Unsupported language: ${languageCode}`);
  process.exit(1);
}

const fetchedAt = new Date().toISOString();
const titles = await searchTitles(languageCode, limit);
const path = join(process.cwd(), "data/content", `${languageCode}.json`);
const existing = JSON.parse(readFileSync(path, "utf8"));
const existingIds = new Set(existing.map((row) => row.id));
const added = [];

for (const hit of titles) {
  const page = await fetchPage(languageCode, hit.title);
  if (!page) continue;
  const source = toSource(page, languageCode, fetchedAt);
  if (!source || existingIds.has(source.id)) continue;
  existing.push(source);
  existingIds.add(source.id);
  added.push(source.id);
}

writeFileSync(path, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
console.log(`Added ${added.length} sources: ${added.join(", ")}`);
