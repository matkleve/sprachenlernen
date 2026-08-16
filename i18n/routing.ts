import { defineRouting } from "next-intl/routing";

/**
 * Stage-1 locales for UC-069. Contract: docs/I18N.md, ADR-0012.
 *
 * No URL prefix — locale comes from the account's spoken-language setting
 * (cookie synced from profiles.spoken_language), not from the path.
 */
export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  localePrefix: "never",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
