/**
 * Server bundle for method material setup. Contract:
 * docs/specs/feature/method-material-setup.md
 */
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { heldLemmaSet } from "@/lib/content-gap";
import type { Source } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";
import type { MethodEntry } from "@/lib/method-catalogue";
import {
  buildMaterialSetupContext,
  hasMaterialSetup,
  type MaterialSetupContext,
} from "@/lib/method-material-setup";

import { loadLexiconForLanguage, loadPersistedSources } from "@/features/content/language-runtime";

export type MaterialSetupBundle = {
  status: "omit";
} | {
  status: "ok";
  languageCode: string;
  context: MaterialSetupContext;
  sources: Source[];
  lexicon: Lexicon;
  heldLemmas: ReadonlySet<string>;
};

export async function readMaterialSetupBundle(
  method: MethodEntry,
  labels: Parameters<typeof buildMaterialSetupContext>[4],
): Promise<MaterialSetupBundle> {
  if (!hasMaterialSetup(method)) return { status: "omit" };

  try {
    const pool = await poolForActiveLanguage();
    if (pool.status !== "ok") return { status: "omit" };

    const languageCode = pool.languageCodes[0] ?? "es";
    const sources = loadPersistedSources(languageCode);
    const lexicon = loadLexiconForLanguage(languageCode);
    if (!lexicon || sources.length === 0) return { status: "omit" };

    const meaningCards = pool.cards.filter((card) => isMeaningRecallTaskId(card.taskId));
    const statesResult = await listTaskStatesForTaskIds(meaningCards.map((card) => card.taskId));
    if (statesResult.status === "error") return { status: "omit" };

    const tasksByTaskId = tasksByTaskIdForCards(meaningCards, statesResult.rows);
    const heldLemmas = heldLemmaSet(meaningCards, tasksByTaskId);
    const context = buildMaterialSetupContext(method, sources, lexicon, heldLemmas, labels);
    if (!context) return { status: "omit" };

    return {
      status: "ok",
      languageCode,
      context,
      sources,
      lexicon,
      heldLemmas,
    };
  } catch {
    return { status: "omit" };
  }
}
