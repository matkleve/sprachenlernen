/**
 * Persisted catalogue adaptation cache. Contract: docs/specs/service/content-adaptation.md
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import type { CacheableAdaptationTier } from "@/lib/content-adaptation";

export const ADAPTATION_CACHE_DIR = join(process.cwd(), "data/adaptations");

export type CachedAdaptation = {
  cacheKey: string;
  sourceId: string;
  languageCode: string;
  targetLevel: string;
  tier: CacheableAdaptationTier;
  promptVersion: string;
  adaptedBody: string;
  coveragePercent: number;
  cachedAt: string;
};

export type AdaptationCacheStore = {
  get: (cacheKey: string) => CachedAdaptation | undefined;
  set: (entry: CachedAdaptation) => void;
  has: (cacheKey: string) => boolean;
};

export function createMemoryAdaptationCache(
  seed: readonly CachedAdaptation[] = [],
): AdaptationCacheStore {
  const entries = new Map(seed.map((entry) => [entry.cacheKey, entry]));
  return {
    get: (cacheKey) => entries.get(cacheKey),
    set: (entry) => {
      entries.set(entry.cacheKey, entry);
    },
    has: (cacheKey) => entries.has(cacheKey),
  };
}

const safeFileName = (cacheKey: string): string =>
  cacheKey.replace(/[^a-zA-Z0-9._-]+/g, "_");

export function createFileAdaptationCache(rootDir: string): AdaptationCacheStore {
  mkdirSync(rootDir, { recursive: true });

  return {
    get(cacheKey) {
      const path = join(rootDir, `${safeFileName(cacheKey)}.json`);
      if (!existsSync(path)) return undefined;
      return JSON.parse(readFileSync(path, "utf8")) as CachedAdaptation;
    },
    set(entry) {
      const path = join(rootDir, `${safeFileName(entry.cacheKey)}.json`);
      writeFileSync(path, `${JSON.stringify(entry, null, 2)}\n`, "utf8");
    },
    has(cacheKey) {
      return existsSync(join(rootDir, `${safeFileName(cacheKey)}.json`));
    },
  };
}

export function loadPersistedAdaptationCache(): AdaptationCacheStore {
  return createFileAdaptationCache(ADAPTATION_CACHE_DIR);
}
