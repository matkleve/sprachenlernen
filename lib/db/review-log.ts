import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import {
  databaseNotSignedIn,
  fromSupabaseReviewError,
  logHandledErrorFromRequest,
} from "@/lib/errors";
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
  /** Client idempotency key from the write queue. */
  reviewId?: string;
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

/**
 * PostgREST takes `in.(…)` in the query string, so the whole task-id list rides
 * in the request line. `/words` and `/progress` both ask for the entire starter
 * pool: at 50 lemmas that was ~1 KB, at 500 it is ~13 KB raw and ~19 KB once
 * encoded — past the request-line limit of a typical gateway, which answers 414
 * rather than returning rows. Every test here is a pure function or a stubbed
 * client, so nothing in the gate can see that; the chunk is what keeps the
 * request bounded as the pool grows again.
 */
const TASK_ID_CHUNK = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
}

function validateAppendInput(input: AppendReviewInput): string | null {
  if (!input.taskId.trim()) return "task_id is required.";
  if (!GRADES.includes(input.grade)) return "grade is invalid.";
  if (!Number.isFinite(input.latencyMs) || input.latencyMs < 0) {
    return "latency_ms must be a non-negative number.";
  }
  if (!isUuid(input.installationId)) return "installation_id must be a UUID.";
  if (input.reviewId !== undefined && !isUuid(input.reviewId)) {
    return "review_id must be a UUID.";
  }
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
    const handled = databaseNotSignedIn({ operation: "save your answer" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const payload = {
    user_id: account.id,
    installation_id: input.installationId,
    task_id: input.taskId,
    grade: input.grade,
    reviewed_at: input.reviewedAt.toISOString(),
    latency_ms: Math.round(input.latencyMs),
    ...(input.reviewId ? { review_id: input.reviewId } : {}),
  };

  const { data, error } = await supabase.from("review_log").insert(payload).select("id").single();

  if (error) {
    // A retry after a successful first insert must not surface as failure.
    if (input.reviewId && error.code === "23505") {
      return { status: "appended", id: input.reviewId };
    }
    const handled = fromSupabaseReviewError(error, { operation: "save your answer" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (!data) {
    return { status: "error", error: "Could not save review." };
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
    const handled = databaseNotSignedIn({ operation: "load your review history" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const chunks = await Promise.all(
    chunk(taskIds, TASK_ID_CHUNK).map((ids) =>
      supabase
        .from("review_log")
        .select(
          "id, user_id, installation_id, task_id, grade, reviewed_at, latency_ms, created_at",
        )
        .in("task_id", ids)
        .order("reviewed_at", { ascending: true }),
    ),
  );

  const failed = chunks.find((result) => result.error);
  if (failed?.error) {
    const handled = fromSupabaseReviewError(failed.error, {
      operation: "load your review history",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  // Each chunk is ordered, the concatenation is not. Callers rebuild scheduler
  // state from this list and FSRS is order-dependent, so the sort is part of
  // the contract, not a tidy-up.
  const reviews = chunks
    .flatMap((result) => result.data ?? [])
    .map((row) => mapRow(row as DbRow))
    .sort((a, b) => Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt));

  return { status: "ok", reviews };
}

export async function listAllReviews(
  client?: SupabaseClient,
): Promise<ListReviewsOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "load your review history" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("review_log")
    .select(
      "id, user_id, installation_id, task_id, grade, reviewed_at, latency_ms, created_at",
    )
    .order("reviewed_at", { ascending: true });

  if (error) {
    const handled = fromSupabaseReviewError(error, { operation: "load your review history" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok", reviews: (data ?? []).map((row) => mapRow(row as DbRow)) };
}

// A single-task `listReviewsForTask` lived here until T-B1. Nothing called it
// once the session builder needed the whole deck's history in one round trip —
// one task is `listReviewsForTaskIds([id])` — and an exported query with no
// caller is the shape that goes untested and then drifts (AGENTS.md § 1).
