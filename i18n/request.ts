import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

import { getSpokenLanguage } from "@/lib/db/profiles";
import { hasSupabaseAuthCookie, resolveLocale } from "@/lib/i18n/resolve-locale";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieList = cookieStore.getAll();
  const spoken =
    hasSupabaseAuthCookie(cookieList) ? await getSpokenLanguage() : null;
  const acceptLanguage = (await headers()).get("accept-language");
  const locale = resolveLocale({
    cookies: cookieList,
    spokenLanguage: spoken,
    acceptLanguage,
  });

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
