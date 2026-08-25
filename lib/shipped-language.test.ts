import { describe, expect, it } from "vitest";

import {
  loadLemmaTableForLanguage,
  loadLexiconForLanguage,
  SHIPPED_CONTENT_LANGUAGES,
} from "@/lib/shipped-language";

describe("loadLexiconForLanguage", () => {
  it("returns one instance per language for the life of the process", () => {
    const first = loadLexiconForLanguage("es");
    const second = loadLexiconForLanguage("es");

    // Identity, not deep equality: rebuilding an equal lexicon would satisfy a
    // toEqual and still cost the 200-320 ms read this cache exists to remove.
    expect(first).not.toBeNull();
    expect(second).toBe(first);
  });

  it("keeps languages apart", () => {
    expect(loadLexiconForLanguage("it")).not.toBe(loadLexiconForLanguage("es"));
  });

  it("returns null for a language that ships no content, without caching a wrong hit", () => {
    expect(loadLexiconForLanguage("fr")).toBeNull();
    expect(loadLexiconForLanguage("fr")).toBeNull();
    expect(loadLexiconForLanguage("es")).not.toBeNull();
  });

  it("resolves through the cached instance the same way it did on the first call", () => {
    const lexicon = loadLexiconForLanguage("es");
    const first = lexicon?.resolve("hablamos");

    expect(loadLexiconForLanguage("es")?.resolve("hablamos")).toEqual(first);
  });

  it("loads a lexicon for every shipped content language", () => {
    for (const code of SHIPPED_CONTENT_LANGUAGES) {
      expect(loadLexiconForLanguage(code), code).not.toBeNull();
    }
  });
});

describe("loadLemmaTableForLanguage", () => {
  it("is cached the same way", () => {
    expect(loadLemmaTableForLanguage("es")).toBe(loadLemmaTableForLanguage("es"));
  });
});
