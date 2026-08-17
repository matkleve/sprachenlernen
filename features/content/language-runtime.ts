/**
 * Shipped language data for content surfaces. Contract:
 * docs/specs/feature/content-traceability.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadSources, type Source } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  type Lexicon,
} from "@/lib/lexicon";

export const SHIPPED_CONTENT_LANGUAGES = ["es", "it"] as const;

export function loadPersistedSources(languageCode: string): Source[] {
  if (!SHIPPED_CONTENT_LANGUAGES.includes(languageCode as (typeof SHIPPED_CONTENT_LANGUAGES)[number])) {
    return [];
  }

  const root = process.cwd();
  try {
    const raw = JSON.parse(readFileSync(join(root, `data/content/${languageCode}.json`), "utf8"));
    const { sources, errors } = loadSources(raw);
    if (errors.length > 0) return [];
    return sources.filter((source) => !source.ephemeral);
  } catch {
    return [];
  }
}

export function loadLexiconForLanguage(languageCode: string): Lexicon | null {
  if (!SHIPPED_CONTENT_LANGUAGES.includes(languageCode as (typeof SHIPPED_CONTENT_LANGUAGES)[number])) {
    return null;
  }

  const root = process.cwd();
  let profileRaw: unknown;
  try {
    profileRaw = JSON.parse(readFileSync(join(root, `data/languages/${languageCode}.json`), "utf8"));
  } catch {
    return null;
  }

  const { profile } = loadProfile(profileRaw);
  if (!profile?.lemmaTable) return null;

  try {
    const frequencyText = readFileSync(join(root, profile.frequency.file), "utf8");
    const lemmaRaw = JSON.parse(readFileSync(join(root, profile.lemmaTable), "utf8"));
    const { table } = loadLemmaTable(lemmaRaw, languageCode);
    if (!table) return null;
    return buildLexicon(profile, parseFrequencyList(frequencyText), table);
  } catch {
    return null;
  }
}
