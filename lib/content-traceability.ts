/**
 * Word→source trace data for the content loop. Contract:
 * docs/specs/feature/content-traceability.md
 */
import {
  buildLemmaSourceIndex,
  type Source,
} from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";

export const WORD_TRACE_TOP_SOURCES = 3;

export type ContentTraceSourceRef = {
  id: string;
  title: string;
};

export type WordTraceView =
  | { kind: "empty" }
  | {
      kind: "appearances";
      appearanceCount: number;
      topSources: readonly ContentTraceSourceRef[];
    };

/** Plain records only — Maps cannot cross the RSC boundary to client components. */
export type ContentTraceIndex = {
  sourcesById: Readonly<Record<string, ContentTraceSourceRef>>;
  lemmaSources: Readonly<Record<string, readonly string[]>>;
};

const persistedSources = (sources: readonly Source[]): Source[] =>
  sources.filter((source) => !source.ephemeral);

export const buildContentTraceIndex = (
  sources: readonly Source[],
  lexicon: Lexicon,
): ContentTraceIndex | null => {
  const saved = persistedSources(sources);
  if (saved.length === 0) return null;

  const sourcesById = Object.fromEntries(
    saved.map((source) => [source.id, { id: source.id, title: source.title }]),
  );
  const lemmaSources = Object.fromEntries(buildLemmaSourceIndex(saved, lexicon));

  return { sourcesById, lemmaSources };
};

export const wordTraceForLemma = (
  lemma: string,
  index: ContentTraceIndex,
): WordTraceView => {
  const sourceIds = index.lemmaSources[lemma] ?? [];
  if (sourceIds.length === 0) return { kind: "empty" };

  const topSources = sourceIds
    .slice(0, WORD_TRACE_TOP_SOURCES)
    .map((id) => index.sourcesById[id])
    .filter((source): source is ContentTraceSourceRef => source !== undefined);

  return {
    kind: "appearances",
    appearanceCount: sourceIds.length,
    topSources,
  };
};
