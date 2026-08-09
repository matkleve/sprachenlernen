/**
 * Reads the shipped language profiles off disk. Contract:
 * docs/specs/page/language-status.md
 *
 * The I/O lives here rather than in lib/, because lib/ is framework- and
 * I/O-free by construction (AGENTS.md) — `loadProfile` takes parsed input and
 * returns errors, and somebody has to be the one that opens the file. It is
 * also not in app/, so it stays reachable from a test without a router.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { loadProfile, type LanguageProfile } from "@/lib/lexicon";

export type InvalidProfile = { file: string; errors: string[] };

export type LoadedLanguages = {
  profiles: LanguageProfile[];
  invalid: InvalidProfile[];
};

export const LANGUAGES_DIR = "data/languages";

/**
 * `root` is a parameter rather than a constant so the test can point at a
 * fixture directory. Production passes nothing and gets the repository root,
 * which is where Next runs the build from.
 */
export const loadLanguages = (root: string = process.cwd()): LoadedLanguages => {
  const dir = join(root, LANGUAGES_DIR);

  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    // A missing directory is the empty state, not a crash. The page says so.
    return { profiles: [], invalid: [] };
  }

  const profiles: LanguageProfile[] = [];
  const invalid: InvalidProfile[] = [];

  for (const file of files.sort()) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (error) {
      invalid.push({ file, errors: [`not valid JSON: ${(error as Error).message}`] });
      continue;
    }

    const { profile, errors } = loadProfile(parsed);
    if (profile) profiles.push(profile);
    else invalid.push({ file, errors });
  }

  // Sorted by the name the reader sees, so the page does not reorder itself
  // when a file is renamed.
  profiles.sort((a, b) => a.name.localeCompare(b.name));

  return { profiles, invalid };
};
