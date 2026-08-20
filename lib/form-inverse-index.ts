/**
 * Inverse index: (lemma, paradigmCell) → accepted surface forms. Contract:
 * docs/specs/service/form-inverse-index.md
 */

import type { FrequencyEntry } from "@/lib/lexicon";
import type { LemmaTable } from "@/lib/lemma-table";

export type AcceptedForm = {
  surface: string;
  primary: boolean;
  variety: string | null;
};

export type CellForms = {
  lemma: string;
  cell: string;
  forms: AcceptedForm[];
};

export type FormInverseIndex = Map<string, CellForms>;

export type GradeFormAnswerResult =
  | { correct: true; matched: string; variety: string | null }
  | { correct: false };

type BuildOptions = {
  frequency?: readonly FrequencyEntry[];
};

const cellKey = (lemma: string, cell: string) => `${lemma}|${cell}`;

/** Strip combining diacritics for accent-insensitive comparison. */
export function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Voseo 2sg in Rioplatense Spanish — `hablás`, `comés`, `vivís`. */
function detectVariety(surface: string, primary: string): string | null {
  if (surface === primary) return null;
  if (/[áéíóú]s$/i.test(surface) && surface.slice(0, -1) + "s" === primary) {
    return "voseo";
  }
  return "alternate";
}

export function isQuarantinedSurface(
  surface: string,
  _lemma: string,
  cell: string,
  candidates: ReadonlySet<string>,
): boolean {
  if (surface === "a") return true;
  if (cell.includes(".") && surface.length < 2) return true;

  const bare = stripDiacritics(surface);
  if (bare !== surface) return false;

  for (const other of candidates) {
    if (other === surface) continue;
    if (stripDiacritics(other) !== bare) continue;
    if (isRegionalAlternate(surface, other)) return false;
    return true;
  }
  return false;
}

/** Peninsular / voseo pairs such as `hablas` · `hablás` — both stay accepted. */
function isRegionalAlternate(unaccented: string, accented: string): boolean {
  return /(?:ás|és|ís|ós)$/i.test(accented) && stripDiacritics(accented) === unaccented;
}

function frequencyRank(
  surface: string,
  frequency: readonly FrequencyEntry[] | undefined,
): number {
  if (!frequency) return Number.MAX_SAFE_INTEGER;
  const entry = frequency.find((row) => row.form === surface);
  return entry?.rank ?? Number.MAX_SAFE_INTEGER;
}

export function buildFormInverseIndex(
  table: LemmaTable,
  options?: BuildOptions,
): FormInverseIndex {
  const buckets = new Map<string, Set<string>>();

  for (const [surface, analyses] of Object.entries(table.forms)) {
    const primary = analyses.find(
      (analysis) =>
        analysis.cell &&
        (analysis.pos === "verb" || analysis.pos === "noun" || analysis.pos === "adj"),
    );
    if (!primary?.cell) continue;

    const key = cellKey(primary.lemma, primary.cell);
    const forms = buckets.get(key) ?? new Set<string>();
    forms.add(surface);
    buckets.set(key, forms);
  }

  const index: FormInverseIndex = new Map();

  for (const [key, candidates] of buckets.entries()) {
    const [lemma, cell] = key.split("|") as [string, string];
    const accepted = [...candidates].filter(
      (surface) => !isQuarantinedSurface(surface, lemma, cell, candidates),
    );
    if (accepted.length === 0) continue;

    accepted.sort(
      (left, right) =>
        frequencyRank(left, options?.frequency) - frequencyRank(right, options?.frequency) ||
        left.localeCompare(right),
    );

    const primary = accepted[0]!;
    index.set(key, {
      lemma,
      cell,
      forms: accepted.map((surface) => ({
        surface,
        primary: surface === primary,
        variety: detectVariety(surface, primary),
      })),
    });
  }

  return index;
}

export function acceptedSurfaces(
  index: FormInverseIndex,
  lemma: string,
  cell: string,
): string[] {
  return index.get(cellKey(lemma, cell))?.forms.map((form) => form.surface) ?? [];
}

export function gradeFormAnswer(
  index: FormInverseIndex,
  lemma: string,
  cell: string,
  answer: string,
): GradeFormAnswerResult {
  const entry = index.get(cellKey(lemma, cell));
  if (!entry) return { correct: false };

  const normalized = answer.trim();
  const match = entry.forms.find((form) => form.surface === normalized);
  if (!match) return { correct: false };
  return { correct: true, matched: match.surface, variety: match.variety };
}
