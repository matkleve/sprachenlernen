/** Contract: docs/specs/service/sentence-check.md */
import type { Analysis, LemmaTable } from "@/lib/lemma-table";

import type { PersonCell } from "./languages";

export type Gender = "m" | "f";
export type Numerus = "sg" | "pl";

export type NominalFeatures = {
  /** Absent when the cell does not say — absent is compatible with anything. */
  gender: Gender | null;
  number: Numerus | null;
};

const NOMINAL = /^(?:comp\.|sup\.)?(?:([mf])\.)?(sg|pl)$/;
const VERB_PERSON = /(?:^|\.)([123](?:sg|pl))$/;

function cellFeatures(cell: string | null): NominalFeatures | null {
  if (!cell) return null;
  const match = NOMINAL.exec(cell);
  if (!match) return null;
  return {
    gender: (match[1] as Gender | undefined) ?? null,
    number: (match[2] as Numerus | undefined) ?? null,
  };
}

/**
 * The features of one reading. Gender for a **noun** comes from the lemma, not
 * the cell: the shipped table writes noun cells as bare `sg`/`pl` and records
 * gender once per lemma (`lemmas.casa = { noun: "f" }`). Reading it off the cell
 * instead would make every noun genderless — and a genderless noun agrees with
 * everything, so the whole agreement rule would go quietly dead.
 *
 * Adjectives keep cell gender. Their lemma entry describes the *noun* sense of
 * the same string (`blanco` → `m`), which would fight every feminine form.
 */
export function nominalFeatures(
  analysis: Analysis,
  table: LemmaTable,
): NominalFeatures | null {
  const features = cellFeatures(analysis.cell);
  if (!features) return null;
  if (analysis.pos !== "noun" || features.gender) return features;

  const gender = table.lemmas[analysis.lemma]?.noun;
  // A lemma the table does not gender stays null — compatible with anything.
  return {
    gender: gender === "m" || gender === "f" ? gender : null,
    number: features.number,
  };
}

export function verbPerson(cell: string | null): PersonCell | null {
  if (!cell) return null;
  const match = VERB_PERSON.exec(cell);
  return (match?.[1] as PersonCell | undefined) ?? null;
}

/**
 * Compatible, not equal: a cell that does not state a feature cannot contradict
 * one. `sg` alone agrees with both `m.sg` and `f.sg` — the table simply did not
 * record gender there, and treating silence as a clash invents an error.
 */
export function featuresAgree(a: NominalFeatures, b: NominalFeatures): boolean {
  if (a.gender && b.gender && a.gender !== b.gender) return false;
  if (a.number && b.number && a.number !== b.number) return false;
  return true;
}

export function isPos(analysis: Analysis, ...pos: readonly Analysis["pos"][]): boolean {
  return pos.includes(analysis.pos);
}

/**
 * `lemma|cell → form`, built once per table and cached. The shipped table maps
 * form → analyses; producing the form that *would* have fitted needs the other
 * direction, and rebuilding it per request would walk 48k entries per keystroke.
 */
const REVERSE_CACHE = new WeakMap<
  LemmaTable,
  Map<string, { form: string; rank: number; tied: boolean }>
>();

/**
 * How central this cell is to that form: the table lists a form's analyses
 * likeliest-first, so position 0 means "this is what the word usually is".
 *
 * The tie-break matters more than it looks. Spanish `el` at `f.sg` is `la`, but
 * a treebank also annotates the stray token `a` as a form of `el` — so "first
 * form encountered" suggested *a* over *la*. Ranking by how central the reading
 * is to each form puts `la` (its only reading) ahead of `a` (its sixth).
 *
 * When two forms are equally central there is no principled winner in this
 * data: `el` at `m.pl` is both `los` and the imported `els`. Rather than pick,
 * we return nothing and the caller flags the word without a suggestion — the
 * same rule spelling uses for two equally near neighbours.
 */
export function formFor(table: LemmaTable, lemma: string, cell: string): string | undefined {
  let index = REVERSE_CACHE.get(table);

  if (!index) {
    index = new Map<string, { form: string; rank: number }>();
    for (const [form, analyses] of Object.entries(table.forms)) {
      analyses.forEach((analysis, rank) => {
        if (!analysis.cell) return;
        const key = `${analysis.lemma}|${analysis.cell}`;
        const held = index!.get(key);
        if (held && held.rank < rank) return;
        if (held && held.rank === rank) {
          index!.set(key, { ...held, tied: true });
          return;
        }
        index!.set(key, { form, rank, tied: false });
      });
    }
    REVERSE_CACHE.set(table, index);
  }

  const best = index.get(`${lemma}|${cell}`);
  return best && !best.tied ? best.form : undefined;
}
