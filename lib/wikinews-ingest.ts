/**
 * Wikinews lane-B ingest helpers. Contract: docs/specs/service/content-ingestion.md
 */
import type { Source } from "@/lib/coverage";
import type { SourceLicence } from "@/lib/content-ingestion";

export const WIKINEWS_ALLOWLIST = {
  es: {
    apiOrigin: "https://es.wikinews.org",
    languageCode: "es",
    attribution: "Wikinews contributors",
    licenceKind: "cc-by" as const,
  },
  en: {
    apiOrigin: "https://en.wikinews.org",
    languageCode: "en",
    attribution: "Wikinews contributors",
    licenceKind: "cc-by" as const,
  },
} as const;

export type WikinewsLanguageCode = keyof typeof WIKINEWS_ALLOWLIST;

export type WikinewsSearchHit = {
  pageid: number;
  title: string;
};

export type WikinewsParsedPage = {
  pageid: number;
  title: string;
  wikitext: string;
  canonicalUrl: string;
};

export function isAllowlistedWikinewsLanguage(
  languageCode: string,
): languageCode is WikinewsLanguageCode {
  return languageCode in WIKINEWS_ALLOWLIST;
}

export function wikinewsSourceId(languageCode: string, pageid: number): string {
  return `wikinews-${languageCode}-${pageid}`;
}

export function wikitextToPlainBody(wikitext: string): string {
  let text = wikitext;
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(/<ref[\s\S]*?<\/ref>/gi, " ");
  text = text.replace(/<ref[^>]*\/>/gi, " ");
  text = text.replace(/\[\[[a-z]{2,3}:[^\]]+\]\]/gi, " ");
  text = text.replace(/\[\[(?:Category|Categoría|Archivo|File):[^\]]+\]\]/gi, " ");
  text = text.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, "$1");
  text = text.replace(/\{\{[\s\S]*?\}\}/g, " ");
  text = text.replace(/^=+\s*(.*?)\s*=+$/gm, "$1");
  text = text.replace(/^\*+\s*/gm, "");
  text = text.replace(/^\s*[a-z]{2,3}:.*$/gim, " ");
  text = text.replace(/\s[a-z]{2,3}:[^\s]+/gi, " ");
  text = text.replace(/(?:Categoría|Category):[^\s]+/gi, " ");
  text = text.replace(/'''+/g, "");
  text = text.replace(/''/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export function parseWikinewsSearchResponse(input: unknown): WikinewsSearchHit[] {
  if (typeof input !== "object" || input === null) return [];
  const search = (input as { query?: { search?: unknown } }).query?.search;
  if (!Array.isArray(search)) return [];

  return search.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const pageid = (entry as { pageid?: unknown }).pageid;
    const title = (entry as { title?: unknown }).title;
    if (typeof pageid !== "number" || typeof title !== "string" || title === "") return [];
    return [{ pageid, title }];
  });
}

export function wikinewsArticleUrl(languageCode: WikinewsLanguageCode, title: string): string {
  const origin = WIKINEWS_ALLOWLIST[languageCode].apiOrigin;
  return `${origin}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

export function parseWikinewsParseResponse(
  input: unknown,
  languageCode?: WikinewsLanguageCode,
): WikinewsParsedPage | null {
  if (typeof input !== "object" || input === null) return null;
  const parse = (input as { parse?: unknown }).parse;
  if (typeof parse !== "object" || parse === null) return null;

  const pageid = (parse as { pageid?: unknown }).pageid;
  const title = (parse as { title?: unknown }).title;
  const wikitext = (parse as { wikitext?: { "*": unknown } }).wikitext?.["*"];
  const canonicalurl = (parse as { canonicalurl?: unknown }).canonicalurl;

  if (typeof pageid !== "number" || typeof title !== "string" || typeof wikitext !== "string") {
    return null;
  }

  const canonicalUrl =
    typeof canonicalurl === "string" && canonicalurl
      ? canonicalurl
      : languageCode
        ? wikinewsArticleUrl(languageCode, title)
        : "";

  if (!canonicalUrl) return null;

  return { pageid, title, wikitext, canonicalUrl };
}

export function normalizeWikinewsPageToSource(
  page: WikinewsParsedPage,
  languageCode: WikinewsLanguageCode,
  fetchedAt: string,
): Source | null {
  const config = WIKINEWS_ALLOWLIST[languageCode];
  const body = wikitextToPlainBody(page.wikitext);
  if (!body) return null;

  const licence: SourceLicence = {
    kind: config.licenceKind,
    attribution: config.attribution,
    sourceUrl: page.canonicalUrl,
    fetchedAt,
  };

  return {
    id: wikinewsSourceId(languageCode, page.pageid),
    languageCode: config.languageCode,
    kind: "text",
    title: page.title,
    origin: "catalogue",
    body,
    tags: ["news"],
    sourceUrl: page.canonicalUrl,
    addedAt: fetchedAt,
    licence,
  };
}

export function wikinewsSearchUrl(
  languageCode: WikinewsLanguageCode,
  query: string,
  limit: number,
): string {
  const origin = WIKINEWS_ALLOWLIST[languageCode].apiOrigin;
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srnamespace: "0",
    srsearch: query,
    srlimit: String(Math.max(1, Math.min(limit, 10))),
    format: "json",
  });
  return `${origin}/w/api.php?${params.toString()}`;
}

export function wikinewsParseUrl(languageCode: WikinewsLanguageCode, title: string): string {
  const origin = WIKINEWS_ALLOWLIST[languageCode].apiOrigin;
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "wikitext",
    format: "json",
  });
  return `${origin}/w/api.php?${params.toString()}`;
}
