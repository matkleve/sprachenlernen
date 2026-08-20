/**
 * Form-mastery cell-group breakdown for Progress. Contract:
 * docs/specs/service/form-mastery-signal.md (T-W5)
 */

import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import { paradigmCellGroupKey, paradigmCellGroupLabel } from "@/lib/form-cell-groups";
import type { StarterCard } from "@/lib/starter-deck";
import { newTask, type Task } from "@/lib/scheduler";
import { bucketForTask } from "@/lib/vocabulary-snapshot";

export type FormCellGroupRow = {
  groupKey: string;
  label: string;
  held: number;
  reviewed: number;
  poolSize: number;
  weak: boolean;
};

type GroupAccumulator = {
  label: string;
  held: number;
  reviewed: number;
  poolSize: number;
};

/**
 * A group is weak when the learner has reviewed forms in it but fewer than half
 * of the pool's forms in that pattern are held stably — actionable via deck=form.
 */
export function isWeakFormCellGroup(held: number, reviewed: number, poolSize: number): boolean {
  if (reviewed === 0 || poolSize === 0) return false;
  return held * 2 < poolSize;
}

export function buildFormCellGroupBreakdown(
  cards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
): FormCellGroupRow[] {
  const groups = new Map<string, GroupAccumulator>();

  for (const card of cards) {
    if (!isFormRecallTaskId(card.taskId) || !card.paradigmCell) continue;

    const groupKey = paradigmCellGroupKey(card.paradigmCell);
    const label = paradigmCellGroupLabel(card.paradigmCell);
    if (!groupKey || !label) continue;

    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    const entry = groups.get(groupKey) ?? { label, held: 0, reviewed: 0, poolSize: 0 };
    entry.poolSize += 1;
    if (task.reviews.length > 0) entry.reviewed += 1;
    if (bucketForTask(task) === "held") entry.held += 1;
    groups.set(groupKey, entry);
  }

  return [...groups.entries()]
    .map(([groupKey, entry]) => ({
      groupKey,
      label: entry.label,
      held: entry.held,
      reviewed: entry.reviewed,
      poolSize: entry.poolSize,
      weak: isWeakFormCellGroup(entry.held, entry.reviewed, entry.poolSize),
    }))
    .sort((a, b) => {
      if (a.weak !== b.weak) return a.weak ? -1 : 1;
      return b.poolSize - a.poolSize || a.label.localeCompare(b.label);
    });
}
