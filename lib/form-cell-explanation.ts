/**
 * Short rule text for one paradigm cell. Contract:
 * docs/specs/service/form-cell-explanation.md
 */

import esRules from "@/data/form-rules/es.json";
import itRules from "@/data/form-rules/it.json";
import esLemma from "@/data/lemma/es.json";
import itLemma from "@/data/lemma/it.json";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";
import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import { loadLemmaTable } from "@/lib/lemma-table";
import { paradigmCellLabel } from "@/lib/paradigm-cells";
import type { StarterCard } from "@/lib/starter-deck";
import type { Task } from "@/lib/scheduler";

export type FormCellExplanationData = {
  /** next-intl key under messages — e.g. formRules.es.verb1.ind.pres */
  ruleKey: string;
  /** Surface forms from the learner's held words, same class when possible. */
  exampleSurfaces: string[];
};

type RuleTable = Record<string, string | Record<string, string>>;

const IRREGULAR_LEMMAS: Record<string, ReadonlySet<string>> = {
  es: new Set([
    "ser",
    "estar",
    "ir",
    "haber",
    "hacer",
    "decir",
    "poder",
    "poner",
    "querer",
    "saber",
    "tener",
    "venir",
    "dar",
    "ver",
  ]),
  it: new Set([
    "essere",
    "avere",
    "fare",
    "andare",
    "dire",
    "dare",
    "stare",
    "volere",
    "potere",
    "dovere",
    "sapere",
    "venire",
    "uscire",
  ]),
};

const RULES_BY_LANGUAGE: Record<string, RuleTable> = {
  es: esRules as RuleTable,
  it: itRules as RuleTable,
};

const LEMMA_TABLES = {
  es: loadLemmaTable(esLemma, "es").table,
  it: loadLemmaTable(itLemma, "it").table,
} as const;

function conjugationClass(languageCode: string, lemma: string): string | undefined {
  const table = LEMMA_TABLES[languageCode as keyof typeof LEMMA_TABLES];
  const entry = table?.lemmas[lemma];
  return entry && typeof entry.verb === "string" ? entry.verb : undefined;
}

function lemmaFromWordId(wordId: string): string {
  const parts = wordId.split(":");
  return parts.length >= 2 ? (parts[1] ?? wordId) : wordId;
}

function tenseKey(paradigmCell: string): string | null {
  const segments = paradigmCell.split(".");
  if (segments.length < 2) return null;
  return `${segments[0]}.${segments[1]}`;
}

function ruleKeyForCell(
  languageCode: string,
  conjugationClass: string | undefined,
  lemma: string,
  paradigmCell: string,
): string | null {
  const table = RULES_BY_LANGUAGE[languageCode];
  if (!table) return null;

  const irregulars = IRREGULAR_LEMMAS[languageCode];
  if (irregulars?.has(lemma)) {
    const irregular = table.irregular;
    return typeof irregular === "string" ? irregular : null;
  }

  if (!conjugationClass) return null;
  const classKey = `verb-${conjugationClass}`;
  const classRules = table[classKey];
  if (!classRules || typeof classRules === "string") return null;

  const tense = tenseKey(paradigmCell);
  if (!tense) return null;
  const key = classRules[tense];
  return typeof key === "string" ? key : null;
}

function heldExampleSurfaces(
  languageCode: string,
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
  classId: string | undefined,
  currentLemma: string,
  currentSurface: string,
  limit = 2,
): string[] {
  const surfaces: string[] = [currentSurface];

  for (const card of pool) {
    if (!isFormRecallTaskId(card.taskId)) continue;
    const lemma = lemmaFromWordId(card.wordId);
    if (lemma === currentLemma) continue;
    const task = tasksByTaskId[card.taskId];
    if (!task || !isTaskHeld(task)) continue;
    const cardClass = conjugationClass(languageCode, lemma);
    if (classId && cardClass !== classId) continue;
    if (card.back) surfaces.push(card.back);
    if (surfaces.length >= limit) break;
  }

  return [...new Set(surfaces)].slice(0, limit);
}

export function buildFormCellExplanation(input: {
  languageCode: string;
  wordId: string;
  paradigmCell: string;
  surfaceForm: string;
  pool: StarterCard[];
  tasksByTaskId: Record<string, Task>;
}): FormCellExplanationData | null {
  const lemma = lemmaFromWordId(input.wordId);
  const label = paradigmCellLabel(input.paradigmCell);
  if (!label) return null;

  const classId = conjugationClass(input.languageCode, lemma);

  const ruleKey = ruleKeyForCell(input.languageCode, classId, lemma, input.paradigmCell);
  if (!ruleKey) return null;

  const exampleSurfaces = heldExampleSurfaces(
    input.languageCode,
    input.pool,
    input.tasksByTaskId,
    classId,
    lemma,
    input.surfaceForm,
  );

  return { ruleKey, exampleSurfaces };
}

/** True when the shipped starter deck includes form-recall for this language. */
export function languageSupportsFormPractice(languageCode: string): boolean {
  return Object.hasOwn(RULES_BY_LANGUAGE, languageCode);
}
