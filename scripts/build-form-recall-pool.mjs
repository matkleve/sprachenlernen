#!/usr/bin/env node
/**
 * Regenerates `data/starter/<lang>-form-recall.json` from the meaning-recall pool
 * and the shipped lemma table. See docs/specs/service/form-recall-pool.md.
 *
 *   node scripts/build-form-recall-pool.mjs [es|it]
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { pathsFor, resolveLang } from "./starter-deck-lang.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { code: LANG, config: LANG_CONFIG } = resolveLang(process.argv[2]);
const paths = pathsFor(ROOT, LANG);

const readFormCounts = async () => {
  const text = await readFile(paths.frequency, "utf8");
  const counts = new Map();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const [form, rawCount] = trimmed.split(/\s+/);
    counts.set(form.toLowerCase(), Number(rawCount));
  }
  return counts;
};

/** @param {unknown} raw */
const primaryAnalysis = (raw) => {
  if (!Array.isArray(raw) || raw.length !== 3) return null;
  const [lemma, pos, cell] = raw;
  if (typeof lemma !== "string" || typeof pos !== "string" || typeof cell !== "string") return null;
  return { lemma, pos, cell: cell === "" ? null : cell };
};

/**
 * The gender a gloss commits to, if any. A gloss is the prompt, so a promise it
 * makes the answer has to keep: `el` glossed "the (masc.)" cannot ask for `la`,
 * however well-formed the cell is on its own.
 */
const genderOfGloss = (gloss) => {
  if (/\(masc\.\)/.test(gloss)) return "m";
  if (/\(fem\.\)/.test(gloss)) return "f";
  return null;
};

/** Mirrors `genderOfCell` in lib/paradigm-cells.ts; the deck test holds them together. */
const genderOfCell = (cell) => cell.split(".").find((part) => part === "m" || part === "f") ?? null;

/** Prefer finite indicative present — the form learners meet first in speech. */
const cellPriority = (cell) => {
  if (cell.startsWith("ind.pres.")) return 0;
  if (cell.startsWith("ind.")) return 1;
  if (cell.startsWith("sub.") || cell.startsWith("cond.") || cell.startsWith("imp.")) return 2;
  if (cell === "inf" || cell.startsWith("ger") || cell.startsWith("part.")) return 3;
  return 4;
};

/**
 * One inflected form per lemma — highest corpus frequency within the best cell
 * tier, so `parlo` wins over `parlando` for *parlare*.
 */
const pickSurfaceForm = (lemma, table, formCounts, glossGender) => {
  let best = null;
  for (const [form, analyses] of Object.entries(table.forms)) {
    if (form === lemma) continue;
    const analysis = primaryAnalysis(analyses[0]);
    if (!analysis || analysis.lemma !== lemma || !analysis.cell) continue;
    const cellGender = genderOfCell(analysis.cell);
    if (glossGender && cellGender && cellGender !== glossGender) continue;
    const count = formCounts.get(form) ?? 0;
    const priority = cellPriority(analysis.cell);
    if (
      !best ||
      priority < best.priority ||
      (priority === best.priority && count > best.count) ||
      (priority === best.priority && count === best.count && form < best.form)
    ) {
      best = { form, cell: analysis.cell, count, priority };
    }
  }
  return best;
};

const build = async () => {
  const [formCounts, table, meaningPool] = await Promise.all([
    readFormCounts(),
    readFile(paths.lemmaTable, "utf8").then((raw) => JSON.parse(raw)),
    readFile(paths.output, "utf8").then((raw) => JSON.parse(raw)),
  ]);

  const cards = [];
  const skipped = [];

  for (const meaningCard of meaningPool.cards) {
    const picked = pickSurfaceForm(
      meaningCard.lemma,
      table,
      formCounts,
      genderOfGloss(meaningCard.back),
    );
    if (!picked) {
      skipped.push(meaningCard.lemma);
      continue;
    }

    cards.push({
      taskId: `${LANG}:${meaningCard.lemma}:${picked.form}:form-recall`,
      wordId: meaningCard.wordId,
      lemma: meaningCard.lemma,
      surfaceForm: picked.form,
      paradigmCell: picked.cell,
      // The meaning, and nothing else. Which cell to produce is `paradigmCell`,
      // and the sentence around both is the card's — see lib/paradigm-cells.ts.
      front: meaningCard.back,
      back: picked.form,
      frequencyRank: meaningCard.frequencyRank,
    });
  }

  const deck = {
    language: LANG,
    taskType: "form-recall",
    cards,
  };

  await writeFile(paths.formRecallOutput, `${JSON.stringify(deck, null, 2)}\n`, "utf8");
  console.log(
    `wrote ${cards.length} form-recall cards (${skipped.length} lemmas had no inflected form) → ${paths.formRecallOutput}`,
  );
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
