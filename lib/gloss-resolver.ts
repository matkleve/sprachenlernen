/**
 * Runtime lookup for learner-facing description strings. Contract:
 * docs/specs/service/gloss-resolver.md
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { dedupeGlossSegments } from "@/lib/dedupe-gloss-segments";
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

  const resolveRaw = (key: string, locale: string): string | undefined => {
    const value = ensureLocale(locale)[key];
    return value !== undefined && value !== "" ? value : undefined;
  };

  return (key, spokenLanguage, fallback = "") => {
    const locale = isSpokenLanguageShipped(spokenLanguage) ? spokenLanguage : "en";
    const localized = resolveRaw(key, locale);
    if (localized !== undefined) return dedupeGlossSegments(localized);

    if (locale !== "en") {
      const english = resolveRaw(key, "en");
      if (english !== undefined) return dedupeGlossSegments(english);
    }

    return dedupeGlossSegments(fallback);
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

export function loadDescriptionSnapshotFromDisk(locale: string): DescriptionSnapshot {
  return loadSnapshotFromDisk(locale);
}
