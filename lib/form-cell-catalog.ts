/**
 * Runtime paradigm-cell pool from the lemma table. Contract:
 * docs/specs/service/form-practice.md (cells are not instantiated in bulk)
 */

import { buildFormCellTaskId } from "@/lib/form-cell-task-id";
import {
  acceptedSurfaces,
  buildFormInverseIndex,
} from "@/lib/form-inverse-index";
import type { CellCandidate } from "@/lib/form-introduction";
import type { FrequencyEntry } from "@/lib/lexicon";
import type { Analysis, LemmaTable } from "@/lib/lemma-table";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { StarterCard } from "@/lib/starter-deck";

export type BuildFormCellCatalogInput = {
  languageCode: string;
  pool: readonly StarterCard[];
  lemmaTable: LemmaTable;
  frequency?: readonly FrequencyEntry[];
};

function practicableAnalysis(analysis: Analysis): analysis is Analysis & { cell: string } {
  return analysis.pos === "verb" && typeof analysis.cell === "string" && analysis.cell.length > 0;
}

/** Collects practisable `(lemma, cell)` keys for lemmas in the meaning pool. */
export function practicableCellKeys(
  lemmaTable: LemmaTable,
  lemmas: ReadonlySet<string>,
): Array<{ lemma: string; pos: string; cell: string }> {
  const keys = new Map<string, { lemma: string; pos: string; cell: string }>();

  for (const list of Object.values(lemmaTable.forms)) {
    for (const analysis of list) {
      if (!practicableAnalysis(analysis)) continue;
      if (!lemmas.has(analysis.lemma)) continue;
      const key = `${analysis.lemma}|${analysis.cell}`;
      keys.set(key, {
        lemma: analysis.lemma,
        pos: analysis.pos,
        cell: analysis.cell,
      });
    }
  }

  return [...keys.values()].sort(
    (left, right) =>
      left.lemma.localeCompare(right.lemma) || left.cell.localeCompare(right.cell),
  );
}

export function buildFormCellCatalog(input: BuildFormCellCatalogInput): StarterCard[] {
  const meaningByLemma = new Map<string, StarterCard>();
  for (const card of input.pool) {
    if (!isMeaningRecallTaskId(card.taskId)) continue;
    meaningByLemma.set(card.lemma, card);
  }

  const lemmas = new Set(meaningByLemma.keys());
  const index = buildFormInverseIndex(input.lemmaTable, { frequency: input.frequency });
  const cells = practicableCellKeys(input.lemmaTable, lemmas);
  const cards: StarterCard[] = [];

  for (const { lemma, pos, cell } of cells) {
    const meaning = meaningByLemma.get(lemma);
    if (!meaning) continue;

    const surfaces = acceptedSurfaces(index, lemma, cell);
    const primary = surfaces[0];
    if (!primary) continue;

    cards.push({
      taskId: buildFormCellTaskId(input.languageCode, lemma, pos, cell),
      wordId: meaning.wordId,
      lemma,
      front: meaning.front,
      descriptionKey: meaning.descriptionKey,
      back: primary,
      frequencyRank: meaning.frequencyRank,
      paradigmCell: cell,
    });
  }

  return cards;
}

export function cellCandidatesFromCards(cards: readonly StarterCard[]): CellCandidate[] {
  return cards.map((card) => ({
    taskId: card.taskId,
    lemma: card.lemma,
    cell: card.paradigmCell ?? "",
    frequencyRank: card.frequencyRank,
  }));
}
