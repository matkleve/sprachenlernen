#!/usr/bin/env node
/**
 * Backfill `task_state` from append-only `review_log` for every user.
 * Contract: docs/specs/service/task-state.supplement.md § Backfill migration.
 *
 * Usage (service role required):
 *   node --experimental-strip-types scripts/backfill-task-state.mts
 *   node --experimental-strip-types scripts/backfill-task-state.mts --user <uuid>
 */

import { createClient } from "@supabase/supabase-js";

import { DEFAULT_CONFIG, rebuild } from "../lib/scheduler.ts";
import { taskStatePayloadFromTask, wordIdFromTaskId } from "../lib/task-from-state.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const userFlag = process.argv.indexOf("--user");
const onlyUser = userFlag !== -1 ? process.argv[userFlag + 1] : null;

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const GRADES = new Set(["again", "hard", "good", "easy"]);

async function listUserIds(): Promise<string[]> {
  if (onlyUser) return [onlyUser];

  const { data, error } = await admin.from("review_log").select("user_id");
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.user_id as string))];
}

async function backfillUser(userId: string): Promise<void> {
  const { data, error } = await admin
    .from("review_log")
    .select("task_id, grade, reviewed_at")
    .eq("user_id", userId)
    .order("reviewed_at", { ascending: true });

  if (error) throw error;

  const byTask = new Map<string, { at: number; grade: "again" | "hard" | "good" | "easy" }[]>();
  for (const row of data ?? []) {
    if (!GRADES.has(row.grade as string)) continue;
    const reviews = byTask.get(row.task_id as string) ?? [];
    reviews.push({
      at: Date.parse(row.reviewed_at as string),
      grade: row.grade as "again" | "hard" | "good" | "easy",
    });
    byTask.set(row.task_id as string, reviews);
  }

  const upserts = [];
  for (const [taskId, reviews] of byTask) {
    const wordId = wordIdFromTaskId(taskId);
    const { task } = rebuild(taskId, wordId, reviews, DEFAULT_CONFIG);
    const last = reviews[reviews.length - 1]!;
    const payload = taskStatePayloadFromTask(task, last.grade, DEFAULT_CONFIG.weightsVersion);

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

const userIds = await listUserIds();
console.log(`backfilling ${userIds.length} user(s)…`);

for (const userId of userIds) {
  await backfillUser(userId);
}

console.log("done");
