/**
 * Typed form-answer grading. Contract:
 * docs/specs/service/form-practice.md (accents §)
 */

import { stripDiacritics } from "@/lib/form-inverse-index";
import type { GradeFormAnswerResult } from "@/lib/form-inverse-index";
import type { LemmaTable } from "@/lib/lemma-table";

export type TypedFormAnswerInput = {
  answer: string;
  acceptedForms: readonly string[];
  lemmaSurfaces: ReadonlySet<string>;
};

export function lemmaSurfacesForLemma(table: LemmaTable, lemma: string): ReadonlySet<string> {
  const surfaces = new Set<string>();
  for (const [surface, analyses] of Object.entries(table.forms)) {
    if (analyses.some((analysis) => analysis.lemma === lemma)) {
      surfaces.add(surface);
    }
  }
  return surfaces;
}

export function gradeTypedFormAnswer(input: TypedFormAnswerInput): GradeFormAnswerResult {
  const normalized = input.answer.trim();
  if (!normalized) return { correct: false };

  const exact = input.acceptedForms.find((form) => form === normalized);
  if (exact) {
    return { correct: true, matched: exact, variety: null };
  }

  const bareAnswer = stripDiacritics(normalized);
  if (input.lemmaSurfaces.has(normalized) || input.lemmaSurfaces.has(bareAnswer)) {
    return { correct: false };
  }

  for (const expected of input.acceptedForms) {
    if (stripDiacritics(expected) !== bareAnswer) continue;
    return { correct: true, matched: expected, variety: null, accentForgiven: true };
  }

  return { correct: false };
}
