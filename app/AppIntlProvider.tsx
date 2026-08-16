import { getLocale, getMessages } from "next-intl/server";

import { IntlProvider } from "./IntlProvider";

export async function AppIntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
