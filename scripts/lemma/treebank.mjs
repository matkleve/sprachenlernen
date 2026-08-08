/**
 * Universal Dependencies (CoNLL-U) reader. Supplies two things the paradigm
 * sources cannot: the function words (`che`, `del`'s parts) they have no
 * entries for, and the decomposition of fused multiword tokens.
 */

import { cellFromUd, parseFeats, POS_FROM_UPOS } from "./cells.mjs";

/**
 * Reads one treebank file into `out.byForm` (form → analysis-key → count) and
 * `out.fused` (surface form → parts-string → count). Both are accumulated
 * across calls, so several treebanks for one language merge into one count.
 */
export const readTreebank = (text, out) => {
  const { byForm, fused } = out;
  let range = null; // an open multiword-token span

  for (const line of text.split("\n")) {
    if (line.startsWith("#")) continue;
    if (line.trim() === "") {
      range = null;
      continue;
    }
    const f = line.split("\t");
    if (f.length < 10) continue;
    const id = f[0];

    if (id.includes("-")) {
      range = { surface: f[1].toLowerCase(), last: Number(id.split("-")[1]), parts: [] };
      continue;
    }
    if (id.includes(".")) continue; // an empty node in an enhanced graph

    const form = f[1].toLowerCase();
    const lemma = f[2].toLowerCase();
    const pos = POS_FROM_UPOS[f[3]];

    if (pos && lemma && lemma !== "_") {
      const key = `${lemma}\t${pos}\t${cellFromUd(pos, parseFeats(f[5])) ?? ""}`;
      if (!byForm.has(form)) byForm.set(form, new Map());
      const counts = byForm.get(form);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    if (range) {
      if (lemma && lemma !== "_") range.parts.push(lemma);
      if (Number(id) >= range.last) {
        const counts = fused.get(range.surface) ?? new Map();
        const key = range.parts.join(" ");
        counts.set(key, (counts.get(key) ?? 0) + 1);
        fused.set(range.surface, counts);
        range = null;
      }
    }
  }
};
