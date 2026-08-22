/**
 * Pool-local form mastery by paradigm cell group. Contract:
 * docs/specs/service/form-mastery-signal.md (T-W5), UC-062
 */
import { formCellGroupKey, formCellGroupLabelKey } from "@/lib/form-cell-groups";
import type { FormRecallCard } from "@/lib/form-recall-pool";
import type { Task } from "@/lib/scheduler";
import { bucketForTask } from "@/lib/vocabulary-snapshot";

export type FormMasteryGroupRow = {
  groupKey: string;
  labelKey: string;
  held: number;
  total: number;
};

export function readFormMasteryGroups(
  formCards: readonly FormRecallCard[],
  tasks: readonly Task[],
  languageCode: string,
): FormMasteryGroupRow[] {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const groups = new Map<string, { held: number; total: number }>();

  for (const card of formCards) {
    const key = formCellGroupKey(languageCode, card.lemma, card.paradigmCell);
    const bucket = groups.get(key) ?? { held: 0, total: 0 };
    bucket.total += 1;
    const task = taskById.get(card.taskId);
    if (task && task.reviews.length > 0 && bucketForTask(task) === "held") {
      bucket.held += 1;
    }
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([groupKey, counts]) => ({
      groupKey,
      labelKey: formCellGroupLabelKey(languageCode, groupKey),
      held: counts.held,
      total: counts.total,
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => a.groupKey.localeCompare(b.groupKey));
}

/** A group with reviewed forms but not all held stably — link to form practice. */
export function isWeakFormGroup(row: FormMasteryGroupRow): boolean {
  return row.total > 0 && row.held < row.total;
}
