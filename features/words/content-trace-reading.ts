/**
 * Loads persisted sources and the lemma→source index for Words home.
 * Contract: docs/specs/feature/content-traceability.md (T-W8b)
 */
import { buildContentTraceIndex, type ContentTraceIndex } from "@/lib/content-traceability";
import { listLearnerSourcesForLanguage } from "@/lib/db/content-sources";

import { loadLexiconForLanguage, loadPersistedSources } from "@/features/content/language-runtime";

export async function loadContentTraceIndex(
  languageCode: string,
): Promise<ContentTraceIndex | null> {
  const fixture = loadPersistedSources(languageCode);
  const learner = await listLearnerSourcesForLanguage(languageCode);
  const sources =
    learner.status === "ok" ? [...fixture, ...learner.sources] : fixture;
  if (sources.length === 0) return null;

  const lexicon = loadLexiconForLanguage(languageCode);
  if (!lexicon) return null;

  return buildContentTraceIndex(sources, lexicon);
}
