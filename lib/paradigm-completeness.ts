/**
 * Whether a verb lemma's generated paradigm table is complete enough to report
 * form mastery without a caveat. Contract: docs/specs/service/lexicon.md (W-5).
 *
 * Uses the same ≥30-cell threshold as `scripts/lemma/assemble.mjs` —
 * incomplete paradigms are flagged, never silently rounded away.
 */

import type { LemmaTable } from "@/lib/lemma-table";

/** Matches `measureParadigms` in `scripts/lemma/assemble.mjs`. */
export const VERB_PARADIGM_COMPLETE_MIN_CELLS = 30;

export function verbCellCount(table: LemmaTable, lemma: string): number {
  const cells = new Set<string>();
  for (const analyses of Object.values(table.forms)) {
    for (const analysis of analyses) {
      if (analysis.lemma === lemma && analysis.pos === "verb" && analysis.cell) {
        cells.add(analysis.cell);
      }
    }
  }
  return cells.size;
}

/** Non-verbs (zero cells) are not flagged — only verb lemmas with a partial table. */
export function isVerbParadigmIncomplete(table: LemmaTable, lemma: string): boolean {
  const count = verbCellCount(table, lemma);
  return count > 0 && count < VERB_PARADIGM_COMPLETE_MIN_CELLS;
}

export function createParadigmCompletenessChecker(
  table: LemmaTable,
): (lemma: string) => boolean {
  return (lemma) => isVerbParadigmIncomplete(table, lemma);
}
