import { describe, expect, it } from "vitest";

import {
  resolveSpokenLanguageFromAcceptLanguage,
  shippedSpokenLanguages,
} from "@/lib/spoken-language";

/** Contract: docs/specs/service/spoken-language.md */

describe("spoken-language", () => {
  it("maps Accept-Language de-DE to de", () => {
    expect(resolveSpokenLanguageFromAcceptLanguage("de-DE,de;q=0.9,en;q=0.8")).toBe("de");
  });

  it("falls back to en when no shipped language matches", () => {
    expect(resolveSpokenLanguageFromAcceptLanguage("fr-FR,fr;q=0.9")).toBe("en");
  });

  it("falls back to en for a missing header", () => {
    expect(resolveSpokenLanguageFromAcceptLanguage(null)).toBe("en");
  });

  it("ships en and de with fixed endonyms", () => {
    expect(shippedSpokenLanguages().map((entry) => entry.code)).toEqual(["en", "de"]);
    expect(shippedSpokenLanguages()[1]?.endonym).toBe("Deutsch");
  });
});
