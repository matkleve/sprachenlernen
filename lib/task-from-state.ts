/**
 * Maps materialized `task_state` rows to scheduler Tasks. Contract:
 * docs/specs/service/task-state.md
 */

import {
  DEFAULT_CONFIG,
  newTask,
  type Grade,
  type Task,
  type TaskState,
} from "@/lib/scheduler";

export type TaskStateRow = {
  taskId: string;
  wordId: string;
  state: TaskState;
  stability: number | null;
  difficulty: number;
  due: string;
  lastReviewAt: string | null;
  lapses: number;
  lastGrade: Grade | null;
  reviewCount: number;
  weightsVersion: string;
};

/** Derives word_id from task_id when the caller has no card context (write path). */
export function wordIdFromTaskId(taskId: string): string {
  if (taskId.endsWith(":meaning-recall")) {
    return taskId.slice(0, -":meaning-recall".length);
  }
  if (taskId.endsWith(":form-recall")) {
    const withoutSuffix = taskId.slice(0, -":form-recall".length);
    const lastColon = withoutSuffix.lastIndexOf(":");
    if (lastColon === -1) {
      throw new Error(`task_id has unexpected shape: ${taskId}`);
    }
    return withoutSuffix.slice(0, lastColon);
  }
  throw new Error(`task_id has unexpected shape: ${taskId}`);
}

/**
 * Materialized rows carry scheduler fields, not the full review log. A single
 * placeholder review keeps `task.reviews.length` checks meaningful for "new vs
 * reviewed" without replaying history on every read.
 */
export function taskFromStateRow(row: TaskStateRow): Task {
  const lastReviewAtMs = row.lastReviewAt ? Date.parse(row.lastReviewAt) : undefined;
  const reviews =
    row.reviewCount > 0 && row.lastGrade && lastReviewAtMs !== undefined
      ? [{ at: lastReviewAtMs, grade: row.lastGrade }]
      : [];

  return {
    id: row.taskId,
    wordId: row.wordId,
    state: row.state,
    stability: row.stability ?? undefined,
    difficulty: row.difficulty,
    due: Date.parse(row.due),
    lastReviewAt: lastReviewAtMs,
    lapses: row.lapses,
    reviews,
  };
}

/** Serializes a scheduler Task after `applyReview` for the transactional RPC. */
export function taskStatePayloadFromTask(
  task: Task,
  grade: Grade,
  weightsVersion: string = DEFAULT_CONFIG.weightsVersion,
): Omit<TaskStateRow, "taskId" | "wordId"> & { lastGrade: Grade } {
  return {
    state: task.state === "new" ? "learning" : task.state,
    stability: task.stability ?? null,
    difficulty: task.difficulty,
    due: new Date(task.due).toISOString(),
    lastReviewAt: task.lastReviewAt ? new Date(task.lastReviewAt).toISOString() : null,
    lapses: task.lapses,
    lastGrade: grade,
    reviewCount: task.reviews.length,
    weightsVersion,
  };
}

export function tasksByTaskIdForCards(
  cards: readonly { taskId: string; wordId: string }[],
  rows: readonly TaskStateRow[],
): Record<string, Task> {
  const rowByTaskId = new Map(rows.map((row) => [row.taskId, row]));
  const out: Record<string, Task> = {};

  for (const card of cards) {
    const row = rowByTaskId.get(card.taskId);
    out[card.taskId] = row ? taskFromStateRow(row) : newTask(card.taskId, card.wordId);
  }

  return out;
}
