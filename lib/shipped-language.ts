/**
 * Shipped language data loaders for server-side lib code.
 * Contract: docs/specs/feature/content-traceability.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
  type LemmaTable,
  type Lexicon,
} from "@/lib/lexicon";

export const SHIPPED_CONTENT_LANGUAGES = ["es", "it"] as const;

export function loadLexiconForLanguage(languageCode: string): Lexicon | null {
  if (
    !SHIPPED_CONTENT_LANGUAGES.includes(
      languageCode as (typeof SHIPPED_CONTENT_LANGUAGES)[number],
    )
  ) {
    return null;
  }

  const root = process.cwd();
  let profileRaw: unknown;
  try {
    profileRaw = JSON.parse(
      readFileSync(join(root, `data/languages/${languageCode}.json`), "utf8"),
    );
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

/**
 * Just the lemma table, cached for the process. Callers that only resolve forms
 * (the sentence checker) should not pay for the frequency list too — it is a
 * second multi-megabyte read for a ranking they never ask about.
 */
const LEMMA_TABLES = new Map<string, LemmaTable | null>();

export function loadLemmaTableForLanguage(languageCode: string): LemmaTable | null {
  const held = LEMMA_TABLES.get(languageCode);
  if (held !== undefined) return held;

  let table: LemmaTable | null = null;
  if (
    SHIPPED_CONTENT_LANGUAGES.includes(
      languageCode as (typeof SHIPPED_CONTENT_LANGUAGES)[number],
    )
  ) {
    try {
      const raw = JSON.parse(
        readFileSync(join(process.cwd(), `data/lemma/${languageCode}.json`), "utf8"),
      );
      table = loadLemmaTable(raw, languageCode).table ?? null;
    } catch {
      // A missing or malformed table is reported by the caller as "cannot check
      // right now" — never as a sentence with nothing wrong in it.
      table = null;
    }
  }

  LEMMA_TABLES.set(languageCode, table);
  return table;
}
