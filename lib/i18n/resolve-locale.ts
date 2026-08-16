import type { SpokenLanguageOutcome } from "@/lib/db/profiles";
import { resolveSpokenLanguageFromAcceptLanguage } from "@/lib/spoken-language";

import { routing, type AppLocale } from "@/i18n/routing";

import { LOCALE_COOKIE } from "./locale-cookie";

export type LocaleCookie = { name: string; value: string };

function isAppLocale(value: string | undefined): value is AppLocale {
  return value !== undefined && routing.locales.includes(value as AppLocale);
}

export function hasSupabaseAuthCookie(cookies: readonly LocaleCookie[]): boolean {
  return cookies.some((cookie) => cookie.name.includes("-auth-token"));
}

/**
 * Resolves chrome locale for a request. Contract: docs/specs/service/spoken-language.md
 *
 * Order: NEXT_LOCALE cookie → signed-in profile spoken_language → Accept-Language → en.
 * Profile is skipped when there is no session cookie, so public pages do not log
 * not-signed-in errors on every render.
 */
export function resolveLocale(input: {
  cookies: readonly LocaleCookie[];
  spokenLanguage: SpokenLanguageOutcome | null;
  acceptLanguage: string | null | undefined;
}): AppLocale {
  const fromCookie = input.cookies.find((cookie) => cookie.name === LOCALE_COOKIE)?.value;
  if (isAppLocale(fromCookie)) return fromCookie;

  if (
    input.spokenLanguage?.status === "ok" &&
    hasSupabaseAuthCookie(input.cookies) &&
    isAppLocale(input.spokenLanguage.spokenLanguage)
  ) {
    return input.spokenLanguage.spokenLanguage;
  }

  const fromHeader = resolveSpokenLanguageFromAcceptLanguage(input.acceptLanguage);
  if (isAppLocale(fromHeader)) return fromHeader;

  return routing.defaultLocale;
}
