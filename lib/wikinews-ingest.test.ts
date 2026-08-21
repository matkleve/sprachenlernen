/**
 * Contract: docs/specs/service/content-ingestion.md (T-CI2)
 */
import { describe, expect, it } from "vitest";

import { loadSources } from "@/lib/coverage";

import {
  normalizeWikinewsPageToSource,
  parseWikinewsParseResponse,
  parseWikinewsSearchResponse,
  wikitextToPlainBody,
  wikinewsSearchUrl,
} from "@/lib/wikinews-ingest";

const sampleWikitext = `{{es}} {{Publicado}}
'''Varsovia, Polonia''' — El alcalde conservador [[Rafał Trzaskowski]] ganó la elección.

[[Categoría:Polonia]]
[[Categoría:Europa]]
`;

describe("wikitextToPlainBody", () => {
  it("strips templates, links, and categories", () => {
    const plain = wikitextToPlainBody(sampleWikitext);
    expect(plain).toContain("Varsovia, Polonia");
    expect(plain).toContain("Rafał Trzaskowski");
    expect(plain).not.toContain("Categoría");
    expect(plain).not.toContain("{{");
    expect(plain).not.toContain("pt:");
  });

  it("strips bullet prefixes and trailing interwiki links", () => {
    const plain = wikitextToPlainBody(
      "*Primera noticia\n*Segunda noticia\n\nTexto principal.\n\npt:Título em português",
    );
    expect(plain).toBe("Primera noticia Segunda noticia Texto principal.");
  });
});

describe("parseWikinewsSearchResponse", () => {
  it("reads page ids and titles from the MediaWiki search payload", () => {
    const hits = parseWikinewsSearchResponse({
      query: {
        search: [{ pageid: 4141, title: "Alcalde conservador de Varsovia" }],
      },
    });
    expect(hits).toEqual([{ pageid: 4141, title: "Alcalde conservador de Varsovia" }]);
  });
});

describe("normalizeWikinewsPageToSource", () => {
  it("produces a licence-cleared catalogue Source that loadSources accepts", () => {
    const page = parseWikinewsParseResponse({
      parse: {
        pageid: 4141,
        title: "Alcalde conservador de Varsovia gana elección presidencial en Polonia",
        wikitext: { "*": sampleWikitext },
      },
    }, "es");
    expect(page).not.toBeNull();

    const source = normalizeWikinewsPageToSource(page!, "es", "2026-08-20T12:00:00.000Z");
    expect(source).not.toBeNull();
    expect(source!.origin).toBe("catalogue");
    expect(source!.licence?.kind).toBe("cc-by");
    expect(source!.licence?.sourceUrl).toContain("wikinews.org");

    const { sources, errors } = loadSources([source]);
    expect(errors).toEqual([]);
    expect(sources).toHaveLength(1);
  });
});

describe("wikinewsSearchUrl", () => {
  it("targets the allowlisted es origin only", () => {
    expect(wikinewsSearchUrl("es", "elecciones", 3)).toBe(
      "https://es.wikinews.org/w/api.php?action=query&list=search&srnamespace=0&srsearch=elecciones&srlimit=3&format=json",
    );
  });
});
