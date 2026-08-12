#!/usr/bin/env node
/**
 * Regenerates `data/starter/es-form-recall.json` from the meaning-recall pool
 * and the shipped lemma table. See docs/specs/service/form-recall-pool.md.
 *
 *   node scripts/build-form-recall-pool.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  frequency: join(ROOT, "data/frequency/es.txt"),
  lemmaTable: join(ROOT, "data/lemma/es.json"),
  meaningPool: join(ROOT, "data/starter/es-meaning-recall.json"),
  output: join(ROOT, "data/starter/es-form-recall.json"),
};

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
 * tier, so `hablo` wins over `hablando` for *hablar*.
 */
const pickSurfaceForm = (lemma, table, formCounts) => {
  let best = null;
  for (const [form, analyses] of Object.entries(table.forms)) {
    if (form === lemma) continue;
    const analysis = primaryAnalysis(analyses[0]);
    if (!analysis || analysis.lemma !== lemma || !analysis.cell) continue;
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
    readFile(paths.meaningPool, "utf8").then((raw) => JSON.parse(raw)),
  ]);

  const cards = [];
  const skipped = [];

  for (const meaningCard of meaningPool.cards) {
    const picked = pickSurfaceForm(meaningCard.lemma, table, formCounts);
    if (!picked) {
      skipped.push(meaningCard.lemma);
      continue;
    }

    cards.push({
      taskId: `es:${meaningCard.lemma}:${picked.form}:form-recall`,
      wordId: meaningCard.wordId,
      lemma: meaningCard.lemma,
      surfaceForm: picked.form,
      paradigmCell: picked.cell,
      front: `${meaningCard.back} — write the Spanish form`,
      back: picked.form,
      frequencyRank: meaningCard.frequencyRank,
    });
  }

  const deck = {
    language: "es",
    taskType: "form-recall",
    cards,
  };

  await writeFile(paths.output, `${JSON.stringify(deck, null, 2)}\n`, "utf8");
  console.log(
    `wrote ${cards.length} form-recall cards (${skipped.length} lemmas had no inflected form) → ${paths.output}`,
  );
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
