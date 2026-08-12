"use server";

import { appendReview } from "@/lib/db/review-log";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import {
  catalogueLoadFailed,
  logHandledErrorFromRequest,
  sessionBuildFailed,
} from "@/lib/errors";
import { buildSession, type SessionCard } from "@/lib/session-builder";
import { filterSchedulableCards } from "@/lib/form-recall-staging";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { languageLabel } from "@/lib/languages";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";
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

export async function buildSessionAction(): Promise<BuildSessionOutcome> {
  try {
    // The language in focus, and only that one (UC-025, corrected
    // 2026-08-12): a session never draws from more than one learning
    // language, so this is always the pool a session should schedule from.
    const pool = await poolForActiveLanguage();
    if (pool.status === "no-language") {
      return { status: "no-language" };
    }
    if (pool.status === "error") {
      const handled = catalogueLoadFailed([pool.error]);
      return { status: "error", error: handled.userMessage };
    }

    // A pool from poolForActiveLanguage never holds more than one language,
    // so this label is always correct — no per-card language name needed.
    const activeCode = pool.languageCodes[0];
    const languageName = activeCode ? languageLabel(activeCode).english : "";

    const taskIds = pool.cards.map((card) => card.taskId);
    const statesResult = await listTaskStatesForTaskIds(taskIds);
    if (statesResult.status === "error") {
      const handled = sessionBuildFailed(statesResult.error);
      return { status: "error", error: handled.userMessage };
    }

    const tasksByTaskId = tasksByTaskIdForCards(pool.cards, statesResult.rows);
    const schedulable = filterSchedulableCards(pool.cards, tasksByTaskId);
    const queue = buildSession(schedulable, tasksByTaskId, Date.now());
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
