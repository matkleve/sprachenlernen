/**
 * Catalogue source ranking for method material setup.
 * Contract: docs/specs/feature/method-material-setup.md
 */
import {
  computeCoverage,
  sourceText,
  sourcesForTopic,
  type Source,
} from "@/lib/coverage";
import type { LearnerWorldId } from "@/lib/learner-world";
import { sourcesMatchingActiveWorld } from "@/lib/learner-world";
import type { Lexicon } from "@/lib/lexicon";

export function pickAppPickSource(
  sources: readonly Source[],
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  activeWorld: LearnerWorldId = "general",
): Source | null {
  if (sources.length === 0) return null;

  const pool = sourcesMatchingActiveWorld(sources, activeWorld);
  const ranked = [...pool]
    .map((source) => ({
      source,
      coverage: computeCoverage(sourceText(source), lexicon, heldLemmas),
    }))
    .sort((a, b) => {
      const comfortableDelta =
        Number(b.coverage.comfortBand === "comfortable") -
        Number(a.coverage.comfortBand === "comfortable");
      if (comfortableDelta !== 0) return comfortableDelta;
      return b.coverage.coveragePercent - a.coverage.coveragePercent;
    });

  return ranked[0]?.source ?? null;
}

export function pickTopicSource(
  sources: readonly Source[],
  topicId: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): Source | null {
  const ranked = sourcesForTopic(sources, topicId, lexicon, heldLemmas);
  return ranked[0]?.source ?? null;
}
