/**
 * Loads persisted sources and the lemma→source index for Words home.
 * Contract: docs/specs/feature/content-traceability.md (T-W8b)
 */
import { buildContentTraceIndex, type ContentTraceIndex } from "@/lib/content-traceability";

import { loadLexiconForLanguage, loadPersistedSources } from "@/features/content/language-runtime";

export function loadContentTraceIndex(languageCode: string): ContentTraceIndex | null {
  const sources = loadPersistedSources(languageCode);
  if (sources.length === 0) return null;

  const lexicon = loadLexiconForLanguage(languageCode);
  if (!lexicon) return null;

  return buildContentTraceIndex(sources, lexicon);
}
