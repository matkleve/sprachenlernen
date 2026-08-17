/**
 * Learner-initiated suspend / retire on Words home. Contract:
 * docs/specs/feature/word-detail.md
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import {
  databaseNotSignedIn,
  fromSupabaseReviewError,
  logHandledErrorFromRequest,
} from "@/lib/errors";
import {
  DEFAULT_CONFIG,
  newTask,
  retire,
  suspend,
  type Task,
} from "@/lib/scheduler";
import {
  taskFromStateRow,
  wordIdFromTaskId,
  type TaskStateRow,
} from "@/lib/task-from-state";

export type TaskLifecycleAction = "suspend" | "retire";

export type ApplyTaskLifecycleOutcome = { status: "ok" } | { status: "error"; error: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

function rowPayload(task: Task, row: TaskStateRow | undefined): Omit<TaskStateRow, "taskId" | "wordId"> {
  return {
    state: task.state,
    stability: task.stability ?? null,
    difficulty: task.difficulty,
    due: new Date(task.due).toISOString(),
    lastReviewAt: task.lastReviewAt ? new Date(task.lastReviewAt).toISOString() : null,
    lapses: task.lapses,
    lastGrade: row?.lastGrade ?? null,
    reviewCount: row?.reviewCount ?? task.reviews.length,
    weightsVersion: row?.weightsVersion ?? DEFAULT_CONFIG.weightsVersion,
  };
}

function applyLifecycle(task: Task, action: TaskLifecycleAction): { task: Task } | { error: string } {
  if (task.state === "retired") {
    return { error: "This word is already removed from your deck." };
  }

  if (action === "suspend") {
    if (task.reviews.length === 0) {
      return { error: "You can suspend a word only after you have reviewed it once." };
    }
    const outcome = suspend(task);
    if (outcome.illegal) {
      return { error: outcome.reason ?? "Could not suspend this word." };
    }
    return { task: outcome.task };
  }

  if (task.state === "new" || task.reviews.length === 0) {
    return { task: { ...task, state: "retired" } };
  }

  const outcome = retire(task);
  if (outcome.illegal) {
    return { error: outcome.reason ?? "Could not remove this word." };
  }
  return { task: outcome.task };
}

export async function applyTaskLifecycle(
  taskId: string,
  action: TaskLifecycleAction,
  client?: SupabaseClient,
): Promise<ApplyTaskLifecycleOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "update this word" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  let wordId: string;
  try {
    wordId = wordIdFromTaskId(taskId);
  } catch {
    return { status: "error", error: "Could not update this word." };
  }

  const stateResult = await listTaskStatesForTaskIds([taskId], supabase);
  if (stateResult.status === "error") {
    return { status: "error", error: stateResult.error };
  }

  const row = stateResult.rows[0];
  const currentTask = row ? taskFromStateRow(row) : newTask(taskId, wordId);
  const applied = applyLifecycle(currentTask, action);
  if ("error" in applied) {
    return { status: "error", error: applied.error };
  }

  const payload = rowPayload(applied.task, row);
  const upsertBody = {
    user_id: account.id,
    task_id: taskId,
    word_id: wordId,
    state: payload.state,
    stability: payload.stability,
    difficulty: payload.difficulty,
    due: payload.due,
    last_review_at: payload.lastReviewAt,
    lapses: payload.lapses,
    last_grade: payload.lastGrade,
    review_count: payload.reviewCount,
    weights_version: payload.weightsVersion,
    updated_at: new Date().toISOString(),
  };

  const { error } = row
    ? await supabase.from("task_state").update(upsertBody).eq("task_id", taskId)
    : await supabase.from("task_state").insert(upsertBody);

  if (error) {
    const handled = fromSupabaseReviewError(error, { operation: "update this word" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}
