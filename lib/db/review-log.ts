import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import { GRADES, type Grade, type Review } from "@/lib/scheduler";
import { isUuid } from "@/lib/uuid";

/**
 * Review log adapter. Contract: docs/specs/service/review-log.md
 *
 * Append-only persistence for answered tasks. Components call this module —
 * never Supabase directly (BACKEND.md §3).
 */

export type ReviewLogRow = {
  id: string;
  userId: string;
  installationId: string;
  taskId: string;
  grade: Grade;
  reviewedAt: string;
  latencyMs: number;
  createdAt: string;
};

export type AppendReviewInput = {
  taskId: string;
  grade: Grade;
  reviewedAt: Date;
  latencyMs: number;
  installationId: string;
};

export type AppendReviewOutcome =
  | { status: "appended"; id: string }
  | { status: "error"; error: string };

export type ListReviewsOutcome =
  | { status: "ok"; reviews: ReviewLogRow[] }
  | { status: "error"; error: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

function validateAppendInput(input: AppendReviewInput): string | null {
  if (!input.taskId.trim()) return "task_id is required.";
  if (!GRADES.includes(input.grade)) return "grade is invalid.";
  if (!Number.isFinite(input.latencyMs) || input.latencyMs < 0) {
    return "latency_ms must be a non-negative number.";
  }
  if (!isUuid(input.installationId)) return "installation_id must be a UUID.";
  if (Number.isNaN(input.reviewedAt.getTime())) return "reviewed_at is invalid.";
  return null;
}

type DbRow = {
  id: string;
  user_id: string;
  installation_id: string;
  task_id: string;
  grade: string;
  reviewed_at: string;
  latency_ms: number;
  created_at: string;
};

function mapRow(row: DbRow): ReviewLogRow {
  return {
    id: row.id,
    userId: row.user_id,
    installationId: row.installation_id,
    taskId: row.task_id,
    grade: row.grade as Grade,
    reviewedAt: row.reviewed_at,
    latencyMs: row.latency_ms,
    createdAt: row.created_at,
  };
}

/** Maps a stored row to the scheduler's append-only review shape. */
export function toSchedulerReview(row: ReviewLogRow): Review {
  return {
    at: new Date(row.reviewedAt).getTime(),
    grade: row.grade,
  };
}

export async function appendReview(
  input: AppendReviewInput,
  client?: SupabaseClient,
): Promise<AppendReviewOutcome> {
  const validationError = validateAppendInput(input);
  if (validationError) {
    return { status: "error", error: validationError };
  }

  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    return { status: "error", error: "Not signed in." };
  }

  const { data, error } = await supabase
    .from("review_log")
    .insert({
      user_id: account.id,
      installation_id: input.installationId,
      task_id: input.taskId,
      grade: input.grade,
      reviewed_at: input.reviewedAt.toISOString(),
      latency_ms: Math.round(input.latencyMs),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", error: error?.message ?? "Could not save review." };
  }

  return { status: "appended", id: data.id };
}

export async function listReviewsForTaskIds(
  taskIds: string[],
  client?: SupabaseClient,
): Promise<ListReviewsOutcome> {
  if (taskIds.length === 0) {
    return { status: "ok", reviews: [] };
  }

  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    return { status: "error", error: "Not signed in." };
  }

  const { data, error } = await supabase
    .from("review_log")
    .select(
      "id, user_id, installation_id, task_id, grade, reviewed_at, latency_ms, created_at",
    )
    .in("task_id", taskIds)
    .order("reviewed_at", { ascending: true });

  if (error) {
    return { status: "error", error: error.message };
  }

  return { status: "ok", reviews: (data ?? []).map((row) => mapRow(row as DbRow)) };
}

// A single-task `listReviewsForTask` lived here until T-B1. Nothing called it
// once the session builder needed the whole deck's history in one round trip —
// one task is `listReviewsForTaskIds([id])` — and an exported query with no
// caller is the shape that goes untested and then drifts (AGENTS.md § 1).
