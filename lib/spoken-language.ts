/**
 * Spoken-language codes the app ships for UC-069. Contract:
 * docs/specs/service/spoken-language.md
 *
 * Endonyms are fixed literals — I18N.md: native language names are never
 * translated, so someone who cannot read the current locale can still find
 * their own.
 */

export type SpokenLanguageLabel = {
  code: string;
  endonym: string;
  english: string;
};

const SHIPPED: SpokenLanguageLabel[] = [
  { code: "en", endonym: "English", english: "English" },
  { code: "de", endonym: "Deutsch", english: "German" },
];

const BY_CODE = new Map(SHIPPED.map((entry) => [entry.code, entry]));

export function shippedSpokenLanguages(): readonly SpokenLanguageLabel[] {
  return SHIPPED;
}

export function isSpokenLanguageShipped(code: string): boolean {
  return BY_CODE.has(code);
}

export function spokenLanguageLabel(code: string): SpokenLanguageLabel {
  return BY_CODE.get(code) ?? { code, endonym: code, english: code };
}

const DEFAULT_SPOKEN_LANGUAGE = "en";

/**
 * Maps an Accept-Language header to the nearest shipped code. Quality values
 * and region subtags are ignored — only the primary subtag matters for v1.
 */
export function resolveSpokenLanguageFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): string {
  if (!acceptLanguage?.trim()) return DEFAULT_SPOKEN_LANGUAGE;

  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0]?.trim().toLowerCase())
    .filter((tag): tag is string => Boolean(tag));

  for (const tag of candidates) {
    const primary = tag.split("-")[0] ?? tag;
    if (isSpokenLanguageShipped(primary)) return primary;
  }

  return DEFAULT_SPOKEN_LANGUAGE;
}

export { DEFAULT_SPOKEN_LANGUAGE };
