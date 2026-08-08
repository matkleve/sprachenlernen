/**
 * Turns a paradigm source + treebank counts + a frequency seed list into the
 * table `data/lemma/<code>.json` ships. Pure — no I/O here; `build-lemma-tables.mjs`
 * fetches the inputs and writes the output.
 */

/**
 * A treebank analysis seen exactly once is more often an annotation error than
 * a rare word. UD_Spanish-GSD carries a few Portuguese sentences, which is how
 * `da → de + o` gets proposed as Spanish. Two independent occurrences removes
 * nearly all of it at almost no cost in coverage.
 */
export const MIN_UD_COUNT = 2;

const conjugationOf = (lemma, table) => {
  let best = null;
  for (const [ending, cls] of table) {
    if (lemma.endsWith(ending) && (!best || ending.length > best[0].length)) {
      best = [ending, cls];
    }
  }
  return best?.[1] ?? null;
};

const indexParadigms = (paradigms) => {
  const byLemma = new Map();
  const lemmasOfForm = new Map();
  for (const entry of paradigms) {
    if (!byLemma.has(entry.lemma)) byLemma.set(entry.lemma, []);
    byLemma.get(entry.lemma).push(entry);
    if (!lemmasOfForm.has(entry.form)) lemmasOfForm.set(entry.form, new Set());
    lemmasOfForm.get(entry.form).add(entry.lemma);
  }
  return { byLemma, lemmasOfForm };
};

/** Every lemma the seed forms reach, from either source. */
const seedLemmas = (seeds, lemmasOfForm, ud) => {
  const lemmas = new Set();
  for (const word of seeds) {
    for (const lemma of lemmasOfForm.get(word) ?? []) lemmas.add(lemma);
    for (const [key, count] of ud.byForm.get(word) ?? []) {
      if (count >= MIN_UD_COUNT) lemmas.add(key.split("\t")[0]);
    }
  }
  return lemmas;
};

/** One lemma can be several parts of speech — Spanish `comer` is a verb and,
 * nominalised, a masculine noun — so the description is keyed by both. */
const describeLemma = (lemmaMeta, lemma, pos, gender, conjugations) => {
  const key = `${lemma}\t${pos}`;
  const meta = lemmaMeta.get(key) ?? { lemma, pos, class: null, gender: null };
  if (pos === "verb") meta.class ??= conjugationOf(lemma, conjugations);
  if (gender) meta.gender ??= gender;
  lemmaMeta.set(key, meta);
};

/** Every form of every seed-reached lemma, from the paradigm source. */
const expandFromParadigms = (lemmas, byLemma, seedSet, config, forms, lemmaMeta) => {
  const add = (form, lemma, pos, cell, weight) => addAnalysis(forms, form, lemma, pos, cell, weight);
  for (const lemma of lemmas) {
    for (const entry of byLemma.get(lemma) ?? []) {
      if (entry.clitic && !seedSet.has(entry.form)) continue;
      add(entry.form, lemma, entry.pos, entry.clitic ? null : entry.cell, 1);
      describeLemma(lemmaMeta, lemma, entry.pos, entry.gender, config.conjugations);
    }
  }
};

/**
 * The treebanks, for what the paradigm source has no entry for. Two guards,
 * because a treebank lemmatiser guesses and its guesses look exactly like
 * data:
 *
 * - an **open-class** lemma (verb, noun, adjective) must be a word that
 *   exists: known to the paradigm lexicon, or attested in the corpus as a
 *   surface form. A lemmatiser confronted with an unknown word back-forms one,
 *   which is where `comir`, `confunder` and `estener` come from — none of
 *   which ever occurs as a word. The corpus clause is what keeps real verbs
 *   the paradigm source happens to lack (UniMorph has no `tener`). Closed
 *   classes are exempt entirely: that is precisely where the paradigm source
 *   has no entry and the treebank is why we are here.
 * - a verb lemma must have the shape of an infinitive, which removes the
 *   participles a lemmatiser leaves un-lemmatised (`dado`, `visto`).
 */
const expandFromTreebank = (ud, lemmas, seedSet, lemmasOfForm, byLemma, config, forms, lemmaMeta) => {
  const OPEN = new Set(["verb", "noun", "adj"]);
  const attested = new Set();
  for (const [form, analyses] of ud.byForm) {
    let total = 0;
    for (const count of analyses.values()) total += count;
    if (total >= MIN_UD_COUNT) attested.add(form);
  }

  for (const [form, analyses] of ud.byForm) {
    for (const [key, count] of analyses) {
      if (count < MIN_UD_COUNT) continue;
      const [lemma, pos, cell] = key.split("\t");
      if (!lemmas.has(lemma) && !seedSet.has(form)) continue;
      const known = lemmasOfForm.has(lemma) || byLemma.has(lemma) || attested.has(lemma);
      if (OPEN.has(pos) && !known) continue;
      if (pos === "verb" && conjugationOf(lemma, config.conjugations) === null) continue;
      addAnalysis(forms, form, lemma, pos, cell === "" ? null : cell, count);
      describeLemma(lemmaMeta, lemma, pos, null, config.conjugations);
    }
  }
};

const addAnalysis = (forms, form, lemma, pos, cell, weight) => {
  if (!lemma || lemma === "_" || !form) return;
  if (!forms.has(form)) forms.set(form, new Map());
  const key = `${lemma}\t${pos}\t${cell ?? ""}`;
  const existing = forms.get(form).get(key);
  if (existing) existing.weight += weight;
  else forms.get(form).set(key, { lemma, pos, cell, weight });
};

/** Fused forms (`del` = de + el): the majority decomposition, if attested enough. */
const decomposeFused = (ud) => {
  const fused = {};
  for (const [form, counts] of ud.fused) {
    let best = null;
    let bestCount = 0;
    for (const [parts, count] of counts) if (count > bestCount) [best, bestCount] = [parts, count];
    if (best === null || bestCount < MIN_UD_COUNT) continue;
    const parts = best.split(" ").filter((p) => p !== "" && p !== "_");
    if (parts.length > 1) fused[form] = parts;
  }
  return fused;
};

/**
 * Three kinds of debris, all of which mislead a learner-facing lexicon more
 * than they help it: a proper-noun reading of an ordinary word, a cell-less
 * duplicate of an analysis that does have a cell, and the un-decomposed
 * reading of a form this table also reports as fused.
 */
const cleanForms = (forms, fused) => {
  for (const [form, analyses] of forms) {
    const kept = [...analyses.values()];
    const common = kept.filter((a) => a.pos !== "propn");
    let cleaned = common.length > 0 ? common : kept;

    const specified = new Set(
      cleaned.filter((a) => a.cell !== null).map((a) => `${a.lemma}\t${a.pos}`),
    );
    cleaned = cleaned.filter((a) => a.cell !== null || !specified.has(`${a.lemma}\t${a.pos}`));

    if (fused[form]) {
      const parts = new Set(fused[form]);
      cleaned = cleaned.filter((a) => a.lemma !== form && !parts.has(a.lemma));
    }

    if (cleaned.length === 0) forms.delete(form);
    else forms.set(form, new Map(cleaned.map((a) => [`${a.lemma}\t${a.pos}\t${a.cell ?? ""}`, a])));
  }
};

/**
 * Orders each form's analyses likeliest-first, so a caller taking the first
 * takes the best guess rather than an arbitrary one — but the list length
 * still tells it that a choice was made. Ties are broken deterministically,
 * and none of the rules are cosmetic:
 *
 * - a form identical to its own lemma is nearly always the base form (`niño`
 *   is the noun, not a stray lemma `niña`);
 * - the citation cell comes before the rest, so `città` reads as a singular
 *   first;
 * - Italian's 1st/2nd-plural indicative and imperative are genuinely
 *   homophonous (`parliamo` is both "we speak" and "let's speak"), so a
 *   treebank with zero attestations of either leaves them tied. Without a rule
 *   the alphabetical fallback picks `imp` over `ind` (`i-m` < `i-n`), which is
 *   backwards: the indicative is the overwhelmingly likelier reading out of
 *   context. Mood markedness breaks that tie in the right direction instead of
 *   an accidental one.
 */
const serialiseForms = (forms) => {
  const CITATION = ["sg", "m.sg", "inf", "ind.pres.1sg", "ind.pres.3sg"];
  const citationRank = (a) => {
    const index = CITATION.indexOf(a.cell ?? "");
    return index === -1 ? CITATION.length : index;
  };
  const MOOD_RANK = { ind: 0, sub: 1, cond: 2, imp: 3 };
  const moodRank = (a) => MOOD_RANK[(a.cell ?? "").split(".")[0]] ?? 4;

  const outForms = {};
  for (const [form, analyses] of [...forms].sort(([a], [b]) => (a < b ? -1 : 1))) {
    outForms[form] = [...analyses.values()]
      .sort(
        (a, b) =>
          b.weight - a.weight ||
          Number(b.lemma === form) - Number(a.lemma === form) ||
          citationRank(a) - citationRank(b) ||
          moodRank(a) - moodRank(b) ||
          (a.lemma < b.lemma ? -1 : a.lemma > b.lemma ? 1 : 0) ||
          ((a.cell ?? "") < (b.cell ?? "") ? -1 : 1),
      )
      .map((a) => [a.lemma, a.pos, a.cell ?? ""]);
  }
  return outForms;
};

/** What a lemma *is*, not how it inflects: a verb's conjugation class, a noun's gender. */
const serialiseLemmas = (lemmaMeta) => {
  const outLemmas = {};
  for (const key of [...lemmaMeta.keys()].sort()) {
    const meta = lemmaMeta.get(key);
    const value = meta.pos === "verb" ? meta.class : meta.gender;
    if (!value) continue;
    outLemmas[meta.lemma] ??= {};
    outLemmas[meta.lemma][meta.pos] = value;
  }
  return outLemmas;
};

/**
 * How complete the verb paradigms actually are. Reported rather than assumed:
 * both paradigm sources have gaps in exactly the verbs a learner meets first
 * (UniMorph has no `tener`), and a table that hid this would let the level
 * model report form mastery it cannot see.
 */
const measureParadigms = (outForms) => {
  const cellsPerVerb = new Map();
  for (const analyses of Object.values(outForms)) {
    for (const [lemma, pos, cell] of analyses) {
      if (pos !== "verb" || cell === "") continue;
      if (!cellsPerVerb.has(lemma)) cellsPerVerb.set(lemma, new Set());
      cellsPerVerb.get(lemma).add(cell);
    }
  }
  const verbs = [...cellsPerVerb.values()];
  const full = verbs.filter((cells) => cells.size >= 30).length;
  return { verbCount: verbs.length, complete: verbs.length === 0 ? 0 : full / verbs.length };
};

/**
 * @param {string} code
 * @param {object} config  one entry of `languages.mjs`'s `LANGUAGES`
 * @param {object[]} paradigms  from `readUnimorph`/`readMorphit`
 * @param {{byForm: Map, fused: Map}} ud  from `readTreebank`
 * @param {string[]} seeds  the frequency list's forms, already truncated
 * @param {number} seedForms  how many seeds were used, for the report
 */
export const assembleTable = (code, config, { paradigms, ud, seeds, seedForms }) => {
  const { byLemma, lemmasOfForm } = indexParadigms(paradigms);
  const seedSet = new Set(seeds);
  const lemmas = seedLemmas(seeds, lemmasOfForm, ud);

  const forms = new Map();
  const lemmaMeta = new Map();
  expandFromParadigms(lemmas, byLemma, seedSet, config, forms, lemmaMeta);
  expandFromTreebank(ud, lemmas, seedSet, lemmasOfForm, byLemma, config, forms, lemmaMeta);

  const fused = decomposeFused(ud);
  cleanForms(forms, fused);

  const outForms = serialiseForms(forms);
  const outLemmas = serialiseLemmas(lemmaMeta);
  const { verbCount, complete } = measureParadigms(outForms);

  const covered = seeds.filter((w) => forms.has(w) || fused[w]).length;
  return {
    language: code,
    generatedBy: "scripts/build-lemma-tables.mjs",
    seedForms,
    seedCoverage: Number((covered / seeds.length).toFixed(4)),
    verbLemmas: verbCount,
    verbParadigmsComplete: Number(complete.toFixed(4)),
    sources: [config.paradigms, ...config.treebanks].map(({ source, licence, url }) => ({
      source,
      licence,
      url,
    })),
    lemmas: outLemmas,
    fused,
    forms: outForms,
  };
};
