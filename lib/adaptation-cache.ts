/**
 * Persisted catalogue adaptation cache. Contract: docs/specs/service/content-adaptation.md
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import type { CacheableAdaptationTier } from "@/lib/content-adaptation";

export const ADAPTATION_CACHE_DIR = join(process.cwd(), "data/adaptations");
export const PERSONAL_ADAPTATION_CACHE_DIR = join(process.cwd(), "data/adaptations-personal");

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

/**
 * Reads always come from disk; writes are attempted there and fall back to
 * memory for the rest of the process if the filesystem refuses them.
 *
 * The fallback is not defensive padding. `loadPersonalAdaptationCache()` is
 * called from Server Actions (features/method-menu/material-setup-actions.ts),
 * and a deployed Next server has a read-only filesystem outside the temp
 * directory — so `mkdirSync` at construction threw `EROFS` on the *first*
 * request that reached the personal path, before any adaptation ran, turning a
 * cache miss into a failed action. `data/adaptations-personal/` is not even in
 * the repository, so that directory never exists in a deployment.
 *
 * What this deliberately does **not** do is choose where personal adaptations
 * should live. `docs/specs/service/content-adaptation.md` still carries
 * "⚠ SPEC GAP: adapted article persistence — one adapted version per learner
 * per source, or re-adapt on each open?", and that is a product decision. Until
 * it is made, a write that cannot land degrades to re-adapting on the next
 * request — which is one of the two answers the gap is between, and the safe
 * one — instead of throwing.
 *
 * The catalogue cache (`data/adaptations/`) is unaffected: it is committed to
 * the repository and written by `scripts/build/adapt-catalogue.mjs`, where the
 * filesystem is writable and the entries are meant to be reviewed in a diff.
 */
export function createFileAdaptationCache(rootDir: string): AdaptationCacheStore {
  const fallback = new Map<string, CachedAdaptation>();
  let writable = true;

  const pathFor = (cacheKey: string) => join(rootDir, `${safeFileName(cacheKey)}.json`);

  return {
    get(cacheKey) {
      const path = pathFor(cacheKey);
      if (existsSync(path)) {
        try {
          return JSON.parse(readFileSync(path, "utf8")) as CachedAdaptation;
        } catch {
          // A truncated or half-written entry is a miss, not a crash: the
          // caller re-adapts and overwrites it.
          return fallback.get(cacheKey);
        }
      }
      return fallback.get(cacheKey);
    },
    set(entry) {
      if (writable) {
        try {
          mkdirSync(rootDir, { recursive: true });
          writeFileSync(pathFor(entry.cacheKey), `${JSON.stringify(entry, null, 2)}\n`, "utf8");
          return;
        } catch {
          // One failure means the whole filesystem is read-only, not this one
          // path — so stop paying for the attempt on every later write.
          writable = false;
        }
      }
      fallback.set(entry.cacheKey, entry);
    },
    has(cacheKey) {
      return existsSync(pathFor(cacheKey)) || fallback.has(cacheKey);
    },
  };
}

export function loadPersistedAdaptationCache(): AdaptationCacheStore {
  return createFileAdaptationCache(ADAPTATION_CACHE_DIR);
}

export function loadPersonalAdaptationCache(): AdaptationCacheStore {
  return createFileAdaptationCache(PERSONAL_ADAPTATION_CACHE_DIR);
}
