/**
 * Load catalogue sources from `data/content/` for server-side recipe builders.
 * Contract: docs/specs/service/coverage.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadSources, type Source } from "@/lib/coverage";

import { CONTENT_SOURCE_LANGUAGES } from "./content-source-constants";

export { CONTENT_SOURCE_LANGUAGES, DEFAULT_PARTIAL_DICTATION_SOURCE_ID } from "./content-source-constants";
export {
  dictationSentenceFromSource,
  gappedSentence,
  pickDictationSentence,
  pickDictationSentences,
} from "./dictation-sentence";

export function loadContentSources(languageCode: string): Source[] {
  if (
    !CONTENT_SOURCE_LANGUAGES.includes(
      languageCode as (typeof CONTENT_SOURCE_LANGUAGES)[number],
    )
  ) {
    return [];
  }

  const root = process.cwd();
  try {
    const raw = JSON.parse(
      readFileSync(join(root, `data/content/${languageCode}.json`), "utf8"),
    );
    const { sources, errors } = loadSources(raw);
    if (errors.length > 0) return [];
    return sources.filter((source) => !source.ephemeral);
  } catch {
    return [];
  }
}

export function findContentSourceById(sourceId: string): Source | null {
  for (const languageCode of CONTENT_SOURCE_LANGUAGES) {
    const match = loadContentSources(languageCode).find(
      (source) => source.id === sourceId,
    );
    if (match) return match;
  }
  return null;
}
