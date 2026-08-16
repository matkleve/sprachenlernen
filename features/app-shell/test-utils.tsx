import { NextIntlClientProvider } from "next-intl";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { AppUpdateProvider } from "@/features/app-shell/AppUpdateProvider";
import en from "@/messages/en.json";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

export function renderWithAppUpdate(ui: ReactElement, options?: RenderOptions) {
  return render(withIntl(<AppUpdateProvider>{ui}</AppUpdateProvider>), options);
}
