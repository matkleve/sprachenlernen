/**
 * Loads persisted sources and the lemma→source index for Words home.
 * Contract: docs/specs/feature/content-traceability.md (T-W8b)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildContentTraceIndex, type ContentTraceIndex } from "@/lib/content-traceability";
import { loadSources } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";

const SHIPPED_CONTENT_LANGUAGES = ["es", "it"] as const;

export function loadContentTraceIndex(languageCode: string): ContentTraceIndex | null {
  if (!SHIPPED_CONTENT_LANGUAGES.includes(languageCode as (typeof SHIPPED_CONTENT_LANGUAGES)[number])) {
    return null;
  }

  const root = process.cwd();
  let sourcesRaw: unknown;
  try {
    sourcesRaw = JSON.parse(readFileSync(join(root, `data/content/${languageCode}.json`), "utf8"));
  } catch {
    return null;
  }

  const { sources, errors } = loadSources(sourcesRaw);
  if (errors.length > 0) return null;

  let profileRaw: unknown;
  try {
    profileRaw = JSON.parse(readFileSync(join(root, `data/languages/${languageCode}.json`), "utf8"));
  } catch {
    return null;
  }

  const { profile } = loadProfile(profileRaw);
  if (!profile?.lemmaTable) return null;

  let frequencyText: string;
  let lemmaRaw: unknown;
  try {
    frequencyText = readFileSync(join(root, profile.frequency.file), "utf8");
    lemmaRaw = JSON.parse(readFileSync(join(root, profile.lemmaTable), "utf8"));
  } catch {
    return null;
  }

  const { table } = loadLemmaTable(lemmaRaw, languageCode);
  if (!table) return null;

  const lexicon = buildLexicon(profile, parseFrequencyList(frequencyText), table);
  return buildContentTraceIndex(sources, lexicon);
}
