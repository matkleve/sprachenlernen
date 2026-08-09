"use server";

import { appendReview } from "@/lib/db/review-log";
import type { Grade } from "@/lib/scheduler";

/**
 * Server Action for persisting a grade. Contract: docs/specs/service/review-log.md
 */

export type AppendReviewActionInput = {
  taskId: string;
  grade: Grade;
  reviewedAtMs: number;
  latencyMs: number;
  installationId: string;
};

export async function appendReviewAction(input: AppendReviewActionInput) {
  return appendReview({
    taskId: input.taskId,
    grade: input.grade,
    reviewedAt: new Date(input.reviewedAtMs),
    latencyMs: input.latencyMs,
    installationId: input.installationId,
  });
}
