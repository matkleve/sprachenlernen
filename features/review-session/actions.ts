"use server";

import { appendReview, listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import {
  catalogueLoadFailed,
  logHandledErrorFromRequest,
  sessionBuildFailed,
} from "@/lib/errors";
import { buildSession, type SessionCard } from "@/lib/session-builder";
import { poolForScheduling } from "@/lib/db/learner-pools";
import type { Grade } from "@/lib/scheduler";

/**
 * Server Actions for the review session. Contracts:
 * - docs/specs/service/review-log.md
 * - docs/specs/feature/review-session.md
 */

export type AppendReviewActionInput = {
  reviewId: string;
  taskId: string;
  grade: Grade;
  reviewedAtMs: number;
  latencyMs: number;
  installationId: string;
};

export async function appendReviewAction(input: AppendReviewActionInput) {
  return appendReview({
    reviewId: input.reviewId,
    taskId: input.taskId,
    grade: input.grade,
    reviewedAt: new Date(input.reviewedAtMs),
    latencyMs: input.latencyMs,
    installationId: input.installationId,
  });
}

export type BuildSessionOutcome =
  | { status: "ok"; queue: SessionCard[]; languageName: string }
  /** Signed in, no language chosen — the caller sends them to the picker. */
  | { status: "no-language" }
  | { status: "error"; error: string };

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  es: "Spanish",
  it: "Italian",
};

export async function buildSessionAction(): Promise<BuildSessionOutcome> {
  try {
    // Every language being learned, not the one on screen. UC-025's combined
    // budget is what stops a second language crowding out the first, and it
    // only works if scheduling ignores the interface's focus.
    const pool = await poolForScheduling();
    if (pool.status === "no-language") {
      return { status: "no-language" };
    }
    if (pool.status === "error") {
      const handled = catalogueLoadFailed([pool.error]);
      return { status: "error", error: handled.userMessage };
    }

    // ⚠ SPEC GAP: with two languages in one session this label is wrong, and
    // the fix is per-card language rather than a session-level name. Cannot
    // happen yet — one pool ships — so it is named rather than guessed.
    const only = pool.languageCodes.length === 1 ? pool.languageCodes[0] : undefined;
    const languageName = only ? (LANGUAGE_DISPLAY_NAMES[only] ?? only) : "";

    const taskIds = pool.cards.map((card) => card.taskId);
    const reviewsResult = await listReviewsForTaskIds(taskIds);
    if (reviewsResult.status === "error") {
      const handled = sessionBuildFailed(reviewsResult.error);
      return { status: "error", error: handled.userMessage };
    }

    const reviewsByTaskId: Record<string, ReturnType<typeof toSchedulerReview>[]> = {};
    for (const row of reviewsResult.reviews) {
      const review = toSchedulerReview(row);
      (reviewsByTaskId[row.taskId] ??= []).push(review);
    }

    const queue = buildSession(pool.cards, reviewsByTaskId, Date.now());
    return { status: "ok", queue, languageName };
  } catch (cause) {
    const handled = sessionBuildFailed(
      cause instanceof Error ? cause.message : String(cause),
    );
    await logHandledErrorFromRequest(handled);
    // Return — do not throw. useReviewSession shows this inline; a thrown
    // AppError does not survive the server-action wire and hits the route
    // boundary as a generic render/boundary instead.
    return { status: "error", error: handled.userMessage };
  }
}
