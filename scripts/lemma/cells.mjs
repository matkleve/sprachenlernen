/**
 * Canonical paradigm cell names, and the Universal Dependencies FEATS → cell
 * mapping. One vocabulary across both source formats and both languages,
 * because the level model compares across them: "produces the 1sg present but
 * not the 1sg subjunctive" has to mean the same thing everywhere. Matched by
 * `lib/lexicon.ts`'s `CELL_PATTERN` — a new cell shape needs both updated.
 *
 *   verb  inf · ger · part.pres · part.past[.m|f.sg|pl]
 *         ind|sub . pres|impf|pret|fut . <person><number>
 *         cond.<person><number> · imp.<person><number>
 *   noun  sg · pl
 *   adj   m.sg · f.pl · … (comp./sup. prefixed where the language marks it)
 *
 * Anything not inflected, or not inflected in a way we model, gets `null` —
 * never an invented cell.
 */

export const POS_FROM_UPOS = {
  VERB: "verb",
  AUX: "verb",
  NOUN: "noun",
  PROPN: "propn",
  ADJ: "adj",
  ADV: "adv",
  DET: "det",
  PRON: "pron",
  ADP: "adp",
  CCONJ: "conj",
  SCONJ: "conj",
  NUM: "num",
  INTJ: "intj",
  PART: "part",
};

export const POS_FROM_MORPHIT = {
  VER: "verb",
  AUX: "verb",
  MOD: "verb",
  CAU: "verb",
  ASP: "verb",
  "NOUN-M": "noun",
  "NOUN-F": "noun",
  NPR: "propn",
  ADJ: "adj",
  ADV: "adv",
  "ART-M": "det",
  "ART-F": "det",
  "ARTPRE-M": "det",
  "ARTPRE-F": "det",
  "DET-DEMO": "det",
  "DET-INDEF": "det",
  "DET-POSS": "det",
  "DET-WH": "det",
  "DET-NUM-CARD": "num",
  "PRO-NUM": "num",
  PRE: "adp",
  CON: "conj",
  INT: "intj",
  WH: "pron",
};

export const PERSON_NUMBER = (person, number) =>
  person && number ? `${person}${number}` : null;

const NUM_FROM_UD = { Sing: "sg", Plur: "pl" };
const GEN_FROM_UD = { Masc: "m", Fem: "f" };
const TENSE_FROM_UD = { Pres: "pres", Imp: "impf", Past: "pret", Fut: "fut" };

export const parseFeats = (raw) => {
  const out = {};
  if (!raw || raw === "_") return out;
  for (const pair of raw.split("|")) {
    const [k, v] = pair.split("=");
    if (k && v) out[k] = v;
  }
  return out;
};

export const cellFromUd = (pos, f) => {
  if (pos === "verb") return cellFromUdVerb(f);
  if (pos === "noun" || pos === "propn") return NUM_FROM_UD[f.Number] ?? null;

  const g = GEN_FROM_UD[f.Gender];
  const n = NUM_FROM_UD[f.Number];
  if (g && n) return `${g}.${n}`;
  return n ?? null;
};

const cellFromUdVerb = (f) => {
  switch (f.VerbForm) {
    case "Inf":
      return "inf";
    case "Ger":
    case "Conv":
      return "ger";
    case "Part": {
      const base = f.Tense === "Pres" ? "part.pres" : "part.past";
      const g = GEN_FROM_UD[f.Gender];
      const n = NUM_FROM_UD[f.Number];
      return g && n ? `${base}.${g}.${n}` : base;
    }
    default:
      break;
  }

  const slot = PERSON_NUMBER(f.Person, NUM_FROM_UD[f.Number]);
  if (!slot) return null;
  const tense = TENSE_FROM_UD[f.Tense];
  switch (f.Mood) {
    case "Cnd":
      return `cond.${slot}`;
    case "Imp":
      return `imp.${slot}`;
    case "Sub":
      return tense ? `sub.${tense}.${slot}` : null;
    case "Ind":
      return tense ? `ind.${tense}.${slot}` : null;
    default:
      return null;
  }
};
