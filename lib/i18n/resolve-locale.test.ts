import { describe, expect, it } from "vitest";

import { LOCALE_COOKIE } from "@/lib/i18n/locale-cookie";
import { hasSupabaseAuthCookie, resolveLocale } from "@/lib/i18n/resolve-locale";

describe("resolveLocale", () => {
  it("prefers the NEXT_LOCALE cookie over profile and Accept-Language", () => {
    expect(
      resolveLocale({
        cookies: [
          { name: LOCALE_COOKIE, value: "de" },
          { name: "sb-project-auth-token", value: "x" },
        ],
        spokenLanguage: { status: "ok", spokenLanguage: "en" },
        acceptLanguage: "en-US,en;q=0.9",
      }),
    ).toBe("de");
  });

  it("uses profile spoken language when signed in and no cookie", () => {
    expect(
      resolveLocale({
        cookies: [{ name: "sb-project-auth-token", value: "x" }],
        spokenLanguage: { status: "ok", spokenLanguage: "de" },
        acceptLanguage: "en-US,en;q=0.9",
      }),
    ).toBe("de");
  });

  it("does not read profile when there is no session cookie", () => {
    expect(
      resolveLocale({
        cookies: [],
        spokenLanguage: { status: "ok", spokenLanguage: "de" },
        acceptLanguage: "en-US,en;q=0.9",
      }),
    ).toBe("en");
  });

  it("falls back to Accept-Language for anonymous visitors", () => {
    expect(
      resolveLocale({
        cookies: [],
        spokenLanguage: null,
        acceptLanguage: "de-DE,de;q=0.9",
      }),
    ).toBe("de");
  });

  it("defaults to en when nothing matches", () => {
    expect(
      resolveLocale({
        cookies: [],
        spokenLanguage: null,
        acceptLanguage: "fr-FR,fr;q=0.9",
      }),
    ).toBe("en");
  });
});

describe("hasSupabaseAuthCookie", () => {
  it("detects Supabase auth cookies", () => {
    expect(hasSupabaseAuthCookie([{ name: "sb-foo-auth-token", value: "1" }])).toBe(true);
    expect(hasSupabaseAuthCookie([{ name: "NEXT_LOCALE", value: "de" }])).toBe(false);
  });
});
