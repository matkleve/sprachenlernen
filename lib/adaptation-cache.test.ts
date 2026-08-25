import { mkdtempSync, chmodSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createFileAdaptationCache,
  createMemoryAdaptationCache,
  type CachedAdaptation,
} from "@/lib/adaptation-cache";

const entry = (cacheKey: string): CachedAdaptation => ({
  cacheKey,
  sourceId: "wikinews-es-1",
  languageCode: "es",
  targetLevel: "A2",
  tier: "T2",
  promptVersion: "v1",
  adaptedBody: "Un texto adaptado.",
  coveragePercent: 96,
  cachedAt: "2026-08-25T00:00:00.000Z",
});

const created: string[] = [];
const scratch = () => {
  const dir = mkdtempSync(join(tmpdir(), "adaptation-cache-"));
  created.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of created.splice(0)) {
    try {
      chmodSync(dir, 0o700);
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* already gone */
    }
  }
});

describe("createFileAdaptationCache", () => {
  it("round-trips an entry through disk", () => {
    const cache = createFileAdaptationCache(join(scratch(), "entries"));
    cache.set(entry("a"));

    expect(cache.has("a")).toBe(true);
    expect(cache.get("a")?.adaptedBody).toBe("Un texto adaptado.");
  });

  it("does not touch the filesystem until something is written", () => {
    const dir = join(scratch(), "not-yet");
    createFileAdaptationCache(dir);

    // Constructing the cache on a read-only deployment must not throw, and a
    // read-only path is exactly where a Server Action reaches for it first.
    expect(existsSync(dir)).toBe(false);
  });

  it("keeps serving reads and writes when the filesystem refuses the write", () => {
    // A plain file standing where the cache directory would go. `mkdirSync`
    // fails with ENOTDIR, which the deployment reaches as EROFS — the point is
    // that the write is refused, not which errno says so. Permission bits would
    // not do: the suite can run as root, and root ignores them.
    const root = scratch();
    const blocked = join(root, "entries");
    writeFileSync(blocked, "not a directory", "utf8");
    const cache = createFileAdaptationCache(blocked);

    expect(() => cache.set(entry("b"))).not.toThrow();
    expect(cache.has("b")).toBe(true);
    expect(cache.get("b")?.coveragePercent).toBe(96);
  });

  it("misses rather than throwing on an unreadable entry", () => {
    const cache = createFileAdaptationCache(join(scratch(), "entries"));
    expect(cache.get("never-written")).toBeUndefined();
    expect(cache.has("never-written")).toBe(false);
  });
});

describe("createMemoryAdaptationCache", () => {
  it("seeds from the entries it is given", () => {
    const cache = createMemoryAdaptationCache([entry("seed")]);
    expect(cache.get("seed")?.sourceId).toBe("wikinews-es-1");
  });
});
