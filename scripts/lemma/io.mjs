/** Fetching and caching the (large, network) source files. */

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Downloads into a cache directory, or reads back what is already there.
 * Sources are large and reproducible, so they are cached rather than
 * committed — see `data/README.md`.
 */
export const fetchCached = async (cacheDir, url, file, encoding) => {
  const path = join(cacheDir, file);
  try {
    await access(path);
    return await readFile(path, encoding);
  } catch {
    /* not cached yet */
  }
  process.stdout.write(`  fetching ${file} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await mkdir(cacheDir, { recursive: true });
  await writeFile(path, bytes);
  process.stdout.write(`${(bytes.length / 1e6).toFixed(1)} MB\n`);
  return bytes.toString(encoding);
};

export const readFrequency = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"))
    .map((l) => l.split(/\s+/)[0].toLowerCase());
