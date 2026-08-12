import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_CONFIG, rebuild, type Grade } from "@/lib/scheduler";
import { taskStatePayloadFromTask, wordIdFromTaskId } from "@/lib/task-from-state";

const GRADES = new Set<Grade>(["again", "hard", "good", "easy"]);

export async function backfillTaskState(
  admin: SupabaseClient,
  options: { onlyUser?: string } = {},
): Promise<void> {
  const userIds = await listUserIds(admin, options.onlyUser);
  console.log(`backfilling ${userIds.length} user(s)…`);

  for (const userId of userIds) {
    await backfillUser(admin, userId);
  }

  console.log("done");
}

async function listUserIds(admin: SupabaseClient, onlyUser?: string): Promise<string[]> {
  if (onlyUser) return [onlyUser];

  const { data, error } = await admin.from("review_log").select("user_id");
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.user_id as string))];
}

async function backfillUser(admin: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await admin
    .from("review_log")
    .select("task_id, grade, reviewed_at")
    .eq("user_id", userId)
    .order("reviewed_at", { ascending: true });

  if (error) throw error;

  const byTask = new Map<string, { at: number; grade: Grade }[]>();
  for (const row of data ?? []) {
    if (!GRADES.has(row.grade as Grade)) continue;
    const reviews = byTask.get(row.task_id as string) ?? [];
    reviews.push({
      at: Date.parse(row.reviewed_at as string),
      grade: row.grade as Grade,
    });
    byTask.set(row.task_id as string, reviews);
  }

  const upserts = [];
  for (const [taskId, reviews] of byTask) {
    const wordId = wordIdFromTaskId(taskId);
    const { task } = rebuild(taskId, wordId, reviews, DEFAULT_CONFIG);
    const last = reviews[reviews.length - 1]!;
    const payload = taskStatePayloadFromTask(
      task,
      last.grade,
      DEFAULT_CONFIG.weightsVersion,
      reviews.length,
    );

    upserts.push({
      user_id: userId,
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
    });
  }

  if (upserts.length === 0) {
    console.log(`user ${userId}: no reviews — skipped`);
    return;
  }

  const { error: upsertError } = await admin.from("task_state").upsert(upserts, {
    onConflict: "user_id,task_id",
  });
  if (upsertError) throw upsertError;

  console.log(`user ${userId}: upserted ${upserts.length} task_state rows`);
}
