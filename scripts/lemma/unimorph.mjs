/** UniMorph reader — the Spanish paradigm source. See `languages.mjs`. */

import { PERSON_NUMBER } from "./cells.mjs";

/** UniMorph tag string → { pos, cell, clitic, gender }. */
export const readUnimorphTag = (tag) => {
  const t = tag.split(";");
  const has = (x) => t.includes(x);
  // A clitic-attached form (`dígalo`) is a productive combination, not a cell of
  // the paradigm.
  const clitic = has("PRO");

  if (t[0] === "N") {
    // Gender is a property of the noun, not of the form — Spanish nouns do not
    // inflect for it. It belongs on the lemma, and it is half of what makes an
    // article learnable.
    return {
      pos: "noun",
      cell: has("PL") ? "pl" : has("SG") ? "sg" : null,
      clitic,
      gender: has("MASC") ? "m" : has("FEM") ? "f" : null,
    };
  }
  if (t[0] === "ADJ") {
    const g = has("MASC") ? "m" : has("FEM") ? "f" : null;
    const n = has("PL") ? "pl" : has("SG") ? "sg" : null;
    return { pos: "adj", cell: g && n ? `${g}.${n}` : n, clitic, gender: null };
  }
  if (t[0] !== "V" && t[0] !== "V.PTCP" && t[0] !== "V.CVB") {
    return { pos: "other", cell: null, clitic, gender: null };
  }

  const pos = "verb";
  if (has("NFIN")) return { pos, cell: "inf", clitic, gender: null };
  if (has("V.CVB")) return { pos, cell: "ger", clitic, gender: null };
  if (has("V.PTCP")) {
    const base = has("PRS") ? "part.pres" : "part.past";
    const g = has("MASC") ? "m" : has("FEM") ? "f" : null;
    const n = has("PL") ? "pl" : has("SG") ? "sg" : null;
    return { pos, cell: g && n ? `${base}.${g}.${n}` : base, clitic, gender: null };
  }

  const slot = PERSON_NUMBER(
    t.find((x) => x === "1" || x === "2" || x === "3"),
    has("PL") ? "pl" : has("SG") ? "sg" : null,
  );
  if (!slot) return { pos, cell: null, clitic, gender: null };
  if (has("COND")) return { pos, cell: `cond.${slot}`, clitic, gender: null };
  if (has("IMP")) return { pos, cell: `imp.${slot}`, clitic, gender: null };

  // PFV/IPFV distinguish the two past tenses and nothing else.
  const tense = has("PRS")
    ? "pres"
    : has("FUT")
      ? "fut"
      : has("PST")
        ? has("IPFV")
          ? "impf"
          : "pret"
        : null;
  if (!tense) return { pos, cell: null, clitic, gender: null };
  return { pos, cell: `${has("SBJV") ? "sub" : "ind"}.${tense}.${slot}`, clitic, gender: null };
};

export const readUnimorph = (text) => {
  const entries = [];
  for (const line of text.split("\n")) {
    const [lemma, form, tag] = line.split("\t");
    if (!lemma || !form || !tag) continue;
    const { pos, cell, clitic, gender } = readUnimorphTag(tag);
    if (pos === "other") continue;
    entries.push({
      lemma: lemma.toLowerCase(),
      form: form.toLowerCase(),
      pos,
      cell,
      clitic,
      gender: gender ?? null,
    });
  }
  return entries;
};
