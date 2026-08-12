/**
 * Readable names for paradigm cells. Contract:
 * docs/specs/service/form-recall-pool.md
 *
 * **Why this is code and not data.** A form-recall card stores the meaning and
 * the cell code (`ind.pres.3sg`) — never the sentence a learner reads. The
 * wording, the order of the parts and where they sit on the card are
 * presentation, and presentation changes without regenerating 1,704 rows. That
 * only holds if the card ships the cell *code* and the label is derived here.
 *
 * Built by composition rather than a 69-entry table, because the cell codes are
 * themselves compositional: a table would have to be extended by hand the first
 * time a pool ships a cell nobody listed, and the failure mode of a missing
 * entry is a prompt that does not say what it is asking for.
 */

export type ParadigmCellLabel = {
  /** The cell this describes, so a caller can key off it without re-parsing. */
  code: string;
  /**
   * Who the form belongs to — the pronoun a learner would say. `null` for cells
   * that have no person: participles, infinitives, plain gender/number.
   */
  person: string | null;
  /** Tense and mood, or gender and number for cells that inflect nominally. */
  form: string;
};

/** Keyed lookup that cannot be fooled by `constructor`, `toString`, … */
function lookup(table: Record<string, string>, key: string): string | null {
  return Object.hasOwn(table, key) ? (table[key] ?? null) : null;
}

/**
 * Pronouns, not grammar labels: "he/she" is what a learner conjugates for,
 * "third person singular" is what a textbook calls it.
 */
const PERSONS: Record<string, string> = {
  "1sg": "I",
  "2sg": "you",
  "3sg": "he/she",
  "1pl": "we",
  "2pl": "you (plural)",
  "3pl": "they",
};

/** Everything before the person segment of a finite cell. */
const TENSES: Record<string, string> = {
  "ind.pres": "present",
  "ind.impf": "imperfect",
  "ind.pret": "preterite",
  "ind.fut": "future",
  "sub.pres": "present subjunctive",
  "sub.impf": "imperfect subjunctive",
  "sub.pret": "preterite subjunctive",
  "sub.fut": "future subjunctive",
  cond: "conditional",
  imp: "imperative",
};

const NUMBERS: Record<string, string> = { sg: "singular", pl: "plural" };

const GENDERS: Record<string, string> = { m: "masculine", f: "feminine" };

const UNINFLECTED: Record<string, string> = { inf: "infinitive", ger: "gerund" };

/**
 * Names a cell, or returns `null` when the code is not one this understands.
 *
 * Null rather than the raw code: `ind.pres.3sg` on screen is noise a learner
 * cannot act on, so the caller drops the line instead. What keeps that from
 * silently costing every card its prompt is the test that walks the shipped
 * lemma table — the guarantee lives there, this is only the guard.
 */
export function paradigmCellLabel(code: string): ParadigmCellLabel | null {
  const uninflected = lookup(UNINFLECTED, code);
  if (uninflected) return { code, person: null, form: uninflected };

  const segments = code.split(".");
  const last = segments[segments.length - 1] ?? "";

  const person = lookup(PERSONS, last);
  if (person) {
    const tense = lookup(TENSES, segments.slice(0, -1).join("."));
    return tense ? { code, person, form: tense } : null;
  }

  // Nominal: an optional `part.past` prefix, an optional gender, a number.
  const isPastParticiple = segments[0] === "part" && segments[1] === "past";
  const rest = isPastParticiple ? segments.slice(2) : segments;
  if (rest.length < 1 || rest.length > 2) return null;

  const number = lookup(NUMBERS, rest[rest.length - 1] ?? "");
  if (!number) return null;
  const gender = rest.length === 2 ? lookup(GENDERS, rest[0] ?? "") : null;
  if (rest.length === 2 && !gender) return null;

  const shape = gender ? `${gender} ${number}` : number;
  return { code, person: null, form: isPastParticiple ? `past participle, ${shape}` : shape };
}

/**
 * The gender a cell commits to, if any. Used where a cell has to agree with
 * something outside itself — a gloss that says "(masc.)" cannot be the prompt
 * for a feminine form, however well-formed both halves are on their own.
 */
export function genderOfCell(code: string): "m" | "f" | null {
  for (const segment of code.split(".")) {
    if (segment === "m" || segment === "f") return segment;
  }
  return null;
}
