/**
 * Runtime lookup for learner-facing description strings. Contract:
 * docs/specs/service/gloss-resolver.md
 */
import deDescriptions from "@/data/i18n/descriptions/de.json";
import enDescriptions from "@/data/i18n/descriptions/en.json";

import { isSpokenLanguageShipped } from "@/lib/spoken-language";

export type DescriptionSnapshot = Readonly<Record<string, string>>;

type SnapshotBundle = Readonly<Record<string, DescriptionSnapshot>>;

type GlossResolverOptions = {
  onLocaleLoad?: (locale: string) => void;
};

const BUNDLED_SNAPSHOTS: SnapshotBundle = {
  en: enDescriptions as DescriptionSnapshot,
  de: deDescriptions as DescriptionSnapshot,
};

export function createGlossResolver(
  snapshots: SnapshotBundle,
  options?: GlossResolverOptions,
): (key: string, spokenLanguage: string, fallback?: string) => string {
  const loadedLocales = new Set<string>();

  const ensureLocale = (locale: string): DescriptionSnapshot => {
    if (!loadedLocales.has(locale)) {
      loadedLocales.add(locale);
      options?.onLocaleLoad?.(locale);
    }
    return snapshots[locale] ?? {};
  };

  return (key, spokenLanguage, fallback = "") => {
    const locale = isSpokenLanguageShipped(spokenLanguage) ? spokenLanguage : "en";
    const localized = ensureLocale(locale)[key];
    if (localized !== undefined && localized !== "") return localized;

    if (locale !== "en") {
      const english = ensureLocale("en")[key];
      if (english !== undefined && english !== "") return english;
    }

    return fallback;
  };
}

let defaultResolver: ReturnType<typeof createGlossResolver> | null = null;

function defaultGlossResolver(): ReturnType<typeof createGlossResolver> {
  if (!defaultResolver) {
    defaultResolver = createGlossResolver(BUNDLED_SNAPSHOTS);
  }
  return defaultResolver;
}

/** Resolves a description key for the account's spoken language. */
export function resolveDescription(
  key: string,
  spokenLanguage: string,
  fallback = "",
): string {
  return defaultGlossResolver()(key, spokenLanguage, fallback);
}

/** Batch resolve — loads each locale snapshot once per call (not per key). */
export function resolveDescriptions(
  keys: readonly string[],
  spokenLanguage: string,
  fallbacks: Readonly<Record<string, string>> = {},
): Readonly<Record<string, string>> {
  const resolver = defaultGlossResolver();
  const out: Record<string, string> = {};
  for (const key of keys) {
    out[key] = resolver(key, spokenLanguage, fallbacks[key] ?? "");
  }
  return out;
}

/** Test hook — swap the process-wide resolver. */
export function setGlossResolverForTests(
  resolver: ReturnType<typeof createGlossResolver> | null,
): void {
  defaultResolver = resolver;
}

/** Bundled English snapshot — same data as `data/i18n/descriptions/en.json`. */
export function loadDescriptionSnapshotFromDisk(locale: string): DescriptionSnapshot {
  return BUNDLED_SNAPSHOTS[locale] ?? {};
}
