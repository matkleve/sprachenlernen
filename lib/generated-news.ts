/**
 * Lane C generated original news — facts-only catalogue fallback.
 * Contract: docs/specs/service/content-ingestion.md (T-CI6)
 */
import { pickTopicSource } from "@/lib/material-source-pick";
import type { Source } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";

export const isLicenceClearedCatalogueSource = (source: Source): boolean =>
  source.origin === "catalogue" &&
  source.generated !== true &&
  source.licence?.kind !== "generated";

export const isGeneratedCatalogueSource = (source: Source): boolean =>
  source.origin === "catalogue" &&
  (source.generated === true || source.licence?.kind === "generated");

export const catalogueSourcesForTopic = (
  sources: readonly Source[],
  topicId: string,
): Source[] =>
  sources.filter(
    (source) => source.origin === "catalogue" && source.tags?.includes(topicId),
  );

/**
 * Prefer licence-cleared lane B; fall back to lane C generated when none exist.
 */
export const pickTopicSourceWithLaneFallback = (
  sources: readonly Source[],
  topicId: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): Source | null => {
  const catalogue = catalogueSourcesForTopic(sources, topicId);
  const licenceCleared = catalogue.filter(isLicenceClearedCatalogueSource);
  if (licenceCleared.length > 0) {
    return pickTopicSource(licenceCleared, topicId, lexicon, heldLemmas);
  }

  const generated = catalogue.filter(isGeneratedCatalogueSource);
  if (generated.length > 0) {
    return pickTopicSource(generated, topicId, lexicon, heldLemmas);
  }

  return pickTopicSource(sources, topicId, lexicon, heldLemmas);
};
