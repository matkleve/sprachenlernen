import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import { taskIdsCacheKey } from "@/lib/db/task-id-cache-key";
import {
  databaseNotSignedIn,
  fromSupabaseReviewError,
  logHandledErrorFromRequest,
} from "@/lib/errors";
import type { TaskStateRow } from "@/lib/task-from-state";
import type { Grade, TaskState } from "@/lib/scheduler";

/**
 * Materialized scheduler state adapter. Contract:
 * docs/specs/service/task-state.md
 */

export type ListTaskStatesOutcome =
  | { status: "ok"; rows: TaskStateRow[] }
  | { status: "error"; error: string };

const TASK_ID_CHUNK = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
}

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

type DbRow = {
  task_id: string;
  word_id: string;
  state: string;
  stability: number | null;
  difficulty: number;
  due: string;
  last_review_at: string | null;
  lapses: number;
  last_grade: string | null;
  review_count: number;
  weights_version: string;
};

function mapRow(row: DbRow): TaskStateRow {
  return {
    taskId: row.task_id,
    wordId: row.word_id,
    state: row.state as TaskState,
    stability: row.stability,
    difficulty: row.difficulty,
    due: row.due,
    lastReviewAt: row.last_review_at,
    lapses: row.lapses,
    lastGrade: row.last_grade as Grade | null,
    reviewCount: row.review_count,
    weightsVersion: row.weights_version,
  };
}

const TASK_STATE_COLUMNS =
  "task_id, word_id, state, stability, difficulty, due, last_review_at, lapses, last_grade, review_count, weights_version";

export async function listTaskStatesForTaskIds(
  taskIds: string[],
  client?: SupabaseClient,
): Promise<ListTaskStatesOutcome> {
  if (taskIds.length === 0) {
    return { status: "ok", rows: [] };
  }

  return listTaskStatesForTaskIdsCached(taskIdsCacheKey(taskIds), taskIds, client);
}

async function listTaskStatesForTaskIdsImpl(
  _taskIdsKey: string,
  taskIds: readonly string[],
  client?: SupabaseClient,
): Promise<ListTaskStatesOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "load your review state" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const uniqueTaskIds = [...new Set(taskIds)];

  const chunks = await Promise.all(
    chunk(uniqueTaskIds, TASK_ID_CHUNK).map((ids) =>
      supabase.from("task_state").select(TASK_STATE_COLUMNS).in("task_id", ids),
    ),
  );

  const failed = chunks.find((result) => result.error);
  if (failed?.error) {
    const handled = fromSupabaseReviewError(failed.error, {
      operation: "load your review state",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const rows = chunks.flatMap((result) => result.data ?? []).map((row) => mapRow(row as DbRow));

  return { status: "ok", rows };
}

const listTaskStatesForTaskIdsCached = cache(listTaskStatesForTaskIdsImpl);

export async function listTaskStatesForUser(
  client?: SupabaseClient,
): Promise<ListTaskStatesOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "load your review state" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase.from("task_state").select(TASK_STATE_COLUMNS);

  if (error) {
    const handled = fromSupabaseReviewError(error, { operation: "load your review state" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok", rows: (data ?? []).map((row) => mapRow(row as DbRow)) };
}
