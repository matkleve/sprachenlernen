import { NextIntlClientProvider, createTranslator } from "next-intl";
import { render, type RenderOptions } from "@testing-library/react";

import de from "@/messages/de.json";
import en from "@/messages/en.json";

export { screen, within, waitFor, fireEvent } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function serverT(namespace: keyof typeof en) {
  return createTranslator({ locale: "en", messages: en, namespace });
}

export function renderWithIntl(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>,
    options,
  );
}

export function renderWithIntlDe(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <NextIntlClientProvider locale="de" messages={de}>{ui}</NextIntlClientProvider>,
    options,
  );
}

export { de, en };
