import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

import { getSpokenLanguage } from "@/lib/db/profiles";
import { LOCALE_COOKIE } from "@/lib/i18n/locale-cookie";
import { resolveSpokenLanguageFromAcceptLanguage } from "@/lib/spoken-language";

import { routing, type AppLocale } from "./routing";

function isAppLocale(value: string | undefined): value is AppLocale {
  return value !== undefined && routing.locales.includes(value as AppLocale);
}

async function resolveLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isAppLocale(fromCookie)) return fromCookie;

  const spoken = await getSpokenLanguage();
  if (spoken.status === "ok" && isAppLocale(spoken.spokenLanguage)) {
    return spoken.spokenLanguage;
  }

  const acceptLanguage = (await headers()).get("accept-language");
  const fromHeader = resolveSpokenLanguageFromAcceptLanguage(acceptLanguage);
  if (isAppLocale(fromHeader)) return fromHeader;

  return routing.defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
