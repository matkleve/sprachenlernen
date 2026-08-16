import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import en from "@/messages/en.json";

type IntlProviderProps = {
  children: ReactNode;
  locale: string;
  messages?: Record<string, unknown>;
};

/**
 * Server wrapper so every route gets the active locale's messages.
 * Locale is resolved in i18n/request.ts from the spoken-language cookie/profile.
 */
export function IntlProvider({ children, locale, messages }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages ?? en}>
      {children}
    </NextIntlClientProvider>
  );
}
