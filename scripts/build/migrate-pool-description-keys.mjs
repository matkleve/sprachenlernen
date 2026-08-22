#!/usr/bin/env node
/**
 * One-time pool migration (T-B11f): add descriptionKey; drop meaning-recall `back`.
 * English glosses live in data/i18n/descriptions/en.json — not in pool JSON.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  cardDescriptionKey,
  descriptionFaceForTaskType,
  taskTypeFromTaskId,
} from "./description-keys.mjs";

const ROOT = join(import.meta.dirname, "../..");

const POOLS = [
  "data/starter/es-meaning-recall.json",
  "data/starter/it-meaning-recall.json",
  "data/starter/es-form-recall.json",
  "data/starter/it-form-recall.json",
];

for (const relative of POOLS) {
  const path = join(ROOT, relative);
  const deck = JSON.parse(await readFile(path, "utf8"));
  let stripped = 0;

  for (const card of deck.cards) {
    const taskType = taskTypeFromTaskId(card.taskId);
    const face = descriptionFaceForTaskType(taskType);
    card.descriptionKey = cardDescriptionKey(card.wordId, taskType, face);
    if (taskType === "meaning-recall" && card.back !== undefined) {
      delete card.back;
      stripped += 1;
    }
  }

  await writeFile(path, `${JSON.stringify(deck, null, 2)}\n`);
  console.log(`migrated ${relative}: ${deck.cards.length} cards, stripped ${stripped} backs`);
}
