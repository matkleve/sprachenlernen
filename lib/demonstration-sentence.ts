/**
 * Demonstration sentence picker. Contract:
 * docs/specs/feature/demonstration-sentence.md
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { newTask, type Task } from "@/lib/scheduler";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";

export type DemonstrationSentenceEntry = {
  id: string;
  text: string;
  tokens: string[];
  lemmaIds: string[];
};

export type DemonstrationSentenceBank = {
  sentences: DemonstrationSentenceEntry[];
};

export type DemonstrationSentencePick = {
  id: string;
  text: string;
  tokens: string[];
  heldCount: number;
  lemmaCount: number;
};

export type DemonstrationSentenceOutcome =
  | { status: "ok"; pick: DemonstrationSentencePick }
  | { status: "omit" }
  | { status: "no-language" };

const banks = new Map<string, DemonstrationSentenceBank>();

export function loadDemonstrationBank(languageCode: string): DemonstrationSentenceBank | null {
  const cached = banks.get(languageCode);
  if (cached) return cached;

  const path = join(process.cwd(), "data/demonstration-sentences", `${languageCode}.json`);
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as DemonstrationSentenceBank;
    if (!Array.isArray(raw.sentences) || raw.sentences.length === 0) return null;
    banks.set(languageCode, raw);
    return raw;
  } catch {
    return null;
  }
}

function stableIndex(length: number, dayKey: string, salt: string): number {
  if (length <= 1) return 0;
  let hash = 0;
  const key = `${dayKey}:${salt}`;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

function unknownCount(lemmaIds: string[], heldWordIds: Set<string>): number {
  return lemmaIds.filter((id) => !heldWordIds.has(id)).length;
}

export function pickDemonstrationSentence(
  bank: DemonstrationSentenceBank,
  heldWordIds: Set<string>,
  dayKey: string,
): DemonstrationSentencePick | null {
  const scored = bank.sentences.map((sentence) => {
    const unknown = unknownCount(sentence.lemmaIds, heldWordIds);
    const distanceFromTarget = Math.abs(unknown - 1.5);
    return { sentence, unknown, distanceFromTarget };
  });

  const minDistance = Math.min(...scored.map((row) => row.distanceFromTarget));
  const candidates = scored.filter((row) => row.distanceFromTarget === minDistance);
  const index = stableIndex(candidates.length, dayKey, candidates[0]?.sentence.id ?? "pick");
  const chosen = candidates[index]?.sentence ?? candidates[0]?.sentence;
  if (!chosen) return null;

  const heldCount = chosen.lemmaIds.filter((id) => heldWordIds.has(id)).length;

  return {
    id: chosen.id,
    text: chosen.text,
    tokens: chosen.tokens,
    heldCount,
    lemmaCount: chosen.lemmaIds.length,
  };
}

export async function readDemonstrationSentence(
  dayKey: string,
): Promise<DemonstrationSentenceOutcome> {
  try {
    const pool = await poolForActiveLanguage();
    if (pool.status === "no-language") return { status: "no-language" };
    if (pool.status === "error") return { status: "omit" };

    const languageCode = pool.languageCodes[0];
    if (!languageCode) return { status: "omit" };

    const bank = loadDemonstrationBank(languageCode);
    if (!bank) return { status: "omit" };

    const cards = pool.cards.filter((card) => isMeaningRecallTaskId(card.taskId));
    const statesResult = await listTaskStatesForTaskIds(cards.map((card) => card.taskId));
    if (statesResult.status === "error") {
      const pick = pickDemonstrationSentence(bank, new Set(), dayKey);
      return pick ? { status: "ok", pick } : { status: "omit" };
    }

    const tasksByTaskId = tasksByTaskIdForCards(cards, statesResult.rows);
    const heldWordIds = new Set<string>();
    for (const card of cards) {
      const task: Task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
      if (isTaskHeld(task)) heldWordIds.add(card.wordId);
    }

    const pick = pickDemonstrationSentence(bank, heldWordIds, dayKey);
    return pick ? { status: "ok", pick } : { status: "omit" };
  } catch {
    return { status: "omit" };
  }
}
