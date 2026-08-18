/**
 * Runtime lookup for learner-facing description strings. Contract:
 * docs/specs/service/gloss-resolver.md
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { isSpokenLanguageShipped } from "@/lib/spoken-language";

export type DescriptionSnapshot = Readonly<Record<string, string>>;

type SnapshotBundle = Readonly<Record<string, DescriptionSnapshot>>;

type GlossResolverOptions = {
  onLocaleLoad?: (locale: string) => void;
};

const SNAPSHOT_DIR = join(process.cwd(), "data/i18n/descriptions");

function loadSnapshotFromDisk(locale: string): DescriptionSnapshot {
  const path = join(SNAPSHOT_DIR, `${locale}.json`);
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as DescriptionSnapshot;
  } catch {
    return {};
  }
}

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
    defaultResolver = createGlossResolver({
      en: loadSnapshotFromDisk("en"),
      de: loadSnapshotFromDisk("de"),
    });
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

/** Test hook — swap the process-wide resolver. */
export function setGlossResolverForTests(
  resolver: ReturnType<typeof createGlossResolver> | null,
): void {
  defaultResolver = resolver;
}

export function loadDescriptionSnapshotFromDisk(locale: string): DescriptionSnapshot {
  return loadSnapshotFromDisk(locale);
}
