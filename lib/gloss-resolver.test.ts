/**
 * Contract: docs/specs/service/gloss-resolver.md
 */
import { describe, expect, it } from "vitest";

import { createGlossResolver, resolveDescription, resolveDescriptions, setGlossResolverForTests } from "@/lib/gloss-resolver";

describe("gloss-resolver", () => {
  const snapshots = {
    en: {
      "card.it:fare.meaning-recall.back": "to do",
    },
    de: {
      "card.it:fare.meaning-recall.back": "tun",
    },
  };

  const resolve = createGlossResolver(snapshots);

  it("returns the published locale string for German", () => {
    expect(resolve("card.it:fare.meaning-recall.back", "de", "")).toBe("tun");
  });

  it("falls back to English when the locale row is missing", () => {
    expect(resolve("card.es:nuevo.meaning-recall.back", "de", "new")).toBe("new");
  });

  it("falls back to inline pool text when the key is missing everywhere", () => {
    expect(resolve("card.it:xyz.meaning-recall.back", "en", "fallback")).toBe("fallback");
  });

  it("loads each locale map once per resolver instance", () => {
    const loads: string[] = [];
    const tracking = createGlossResolver(
      {
        en: { "card.es:nuevo.meaning-recall.back": "new" },
        de: {},
      },
      {
        onLocaleLoad: (locale) => loads.push(locale),
      },
    );
    tracking("card.es:nuevo.meaning-recall.back", "de", "inline");
    tracking("card.es:nuevo.meaning-recall.back", "de", "inline");
    expect(loads).toEqual(["de", "en"]);
  });

  it("reads shipped de.json for Italian fare", () => {
    setGlossResolverForTests(null);
    const german = resolveDescription("card.it:fare.meaning-recall.back", "de", "to do");
    expect(german).not.toBe("to do");
    expect(german.length).toBeGreaterThan(0);
    setGlossResolverForTests(null);
  });

  it("resolveDescriptions returns a map for every key", () => {
    const batch = createGlossResolver(snapshots);
    setGlossResolverForTests(batch);
    const result = resolveDescriptions(
      ["card.it:fare.meaning-recall.back", "card.es:nuevo.meaning-recall.back"],
      "de",
      { "card.es:nuevo.meaning-recall.back": "new" },
    );
    expect(result["card.it:fare.meaning-recall.back"]).toBe("tun");
    expect(result["card.es:nuevo.meaning-recall.back"]).toBe("new");
    setGlossResolverForTests(null);
  });
});
