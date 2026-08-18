import { cache } from "react";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { StarterCard } from "@/lib/starter-deck";
import type { TaskStateRow } from "@/lib/task-from-state";

/**
 * Active-language meaning-recall cards and their materialized state. Shared by
 * standing and the demonstration sentence so `/methods` does not load the
 * pool and task_state rows twice per navigation.
 */
export type ActiveMeaningRecallOutcome =
  | { status: "no-language" }
  | { status: "error" }
  | { status: "states-error"; languageCode: string; cards: StarterCard[] }
  | {
      status: "ok";
      languageCode: string;
      cards: StarterCard[];
      stateRows: TaskStateRow[];
    };

async function readActiveMeaningRecallImpl(): Promise<ActiveMeaningRecallOutcome> {
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") return { status: "error" };

  const languageCode = pool.languageCodes[0];
  if (!languageCode) return { status: "error" };

  const cards = pool.cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  const statesResult = await listTaskStatesForTaskIds(cards.map((card) => card.taskId));
  if (statesResult.status === "error") {
    return { status: "states-error", languageCode, cards };
  }

  return { status: "ok", languageCode, cards, stateRows: statesResult.rows };
}

export const readActiveMeaningRecall = cache(readActiveMeaningRecallImpl);
