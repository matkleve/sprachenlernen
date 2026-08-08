/** Morph-it! reader — the Italian paradigm source. See `languages.mjs`. */

import { PERSON_NUMBER, POS_FROM_MORPHIT } from "./cells.mjs";

const MORPHIT_MOOD = { ind: "ind", sub: "sub", cond: "cond", impr: "imp" };
// Morph-it's `past` is the passato remoto, i.e. the perfective past.
const MORPHIT_TENSE = { pres: "pres", impf: "impf", past: "pret", fut: "fut" };

/** Morph-it tag (`VER:ind+pres+1+s`, `NOUN-F:p`) → { pos, cell, clitic, gender }. */
export const readMorphitTag = (tag) => {
  const [rawPos, rawFeats = ""] = tag.split(":");
  const pos = POS_FROM_MORPHIT[rawPos];
  if (!pos) return null; // punctuation, symbols, abbreviations

  const parts = rawFeats === "" ? [] : rawFeats.split("+");
  const gender = rawPos === "NOUN-M" ? "m" : rawPos === "NOUN-F" ? "f" : null;
  const num = parts.includes("p") ? "pl" : parts.includes("s") ? "sg" : null;
  const gen = parts.includes("m") ? "m" : parts.includes("f") ? "f" : null;

  if (pos === "verb") return readMorphitVerb(parts, { pos, gender });
  if (pos === "noun" || pos === "propn") return { pos, cell: num, clitic: false, gender };

  if (pos === "adj") {
    // `pos` (positive), `comp`, `sup` — the degree, which the app treats as part
    // of the cell because comparatives are a separate thing to learn.
    const degree = parts.includes("comp") ? "comp." : parts.includes("sup") ? "sup." : "";
    const agreement = gen && num ? `${gen}.${num}` : num;
    return { pos, cell: agreement ? `${degree}${agreement}` : null, clitic: false, gender };
  }

  return { pos, cell: gen && num ? `${gen}.${num}` : num, clitic: false, gender };
};

const readMorphitVerb = (parts, { pos, gender }) => {
  const [mood, tense, ...rest] = parts;
  const num = parts.includes("p") ? "pl" : parts.includes("s") ? "sg" : null;
  const gen = parts.includes("m") ? "m" : parts.includes("f") ? "f" : null;
  // Any trailing component that is not a person or number is an attached
  // clitic (`dirmelo`, `andandosene`).
  const clitic = rest.some((p) => !/^[123]$/.test(p) && p !== "s" && p !== "p");

  if (mood === "inf") return { pos, cell: "inf", clitic, gender };
  if (mood === "ger") return { pos, cell: "ger", clitic, gender };
  if (mood === "part") {
    const base = tense === "pres" ? "part.pres" : "part.past";
    return { pos, cell: gen && num ? `${base}.${gen}.${num}` : base, clitic, gender };
  }

  const m = MORPHIT_MOOD[mood];
  const slot = PERSON_NUMBER(
    rest.find((p) => /^[123]$/.test(p)) ?? parts.find((p) => /^[123]$/.test(p)),
    num,
  );
  if (!m || !slot) return { pos, cell: null, clitic, gender };
  if (m === "cond" || m === "imp") return { pos, cell: `${m}.${slot}`, clitic, gender };
  const t = MORPHIT_TENSE[tense];
  return { pos, cell: t ? `${m}.${t}.${slot}` : null, clitic, gender };
};

export const readMorphit = (text) => {
  const entries = [];
  for (const line of text.split("\n")) {
    const [form, lemma, tag] = line.split("\t");
    if (!form || !lemma || !tag) continue;
    const parsed = readMorphitTag(tag.trim());
    if (!parsed) continue;
    entries.push({
      lemma: lemma.toLowerCase(),
      form: form.toLowerCase(),
      pos: parsed.pos,
      cell: parsed.cell,
      clitic: parsed.clitic,
      gender: parsed.gender,
    });
  }
  return entries;
};
