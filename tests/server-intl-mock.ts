import { createTranslator } from "next-intl";
import { vi } from "vitest";

import en from "@/messages/en.json";

type Namespace = keyof typeof en;

function translatorFor(namespace: Namespace) {
  return createTranslator({
    locale: "en",
    messages: en,
    namespace,
  });
}

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: Namespace) => translatorFor(namespace)),
  getLocale: vi.fn(async () => "en"),
  getMessages: vi.fn(async () => en),
}));
