"use client";

import { appendReviewAction } from "@/features/review-session/actions";
import {
  createIndexedDbReviewQueueStorage,
  createInMemoryReviewQueueStorage,
  createReviewWriteQueue,
  type ReviewWriteQueue,
} from "@/lib/db/review-write-queue";

let queue: ReviewWriteQueue | null = null;

/** Client singleton for the review write queue. */
export function getReviewQueue(): ReviewWriteQueue {
  if (!queue) {
    let storage;
    try {
      storage =
        typeof indexedDB !== "undefined"
          ? createIndexedDbReviewQueueStorage()
          : createInMemoryReviewQueueStorage();
    } catch {
      storage = createInMemoryReviewQueueStorage();
    }

    queue = createReviewWriteQueue({
      storage,
      flush: async (input) => {
        try {
          const result = await appendReviewAction({
            reviewId: input.reviewId,
            taskId: input.taskId,
            grade: input.grade,
            reviewedAtMs: input.reviewedAtMs,
            latencyMs: input.latencyMs,
            installationId: input.installationId,
          });
          return result.status === "appended"
            ? { status: "appended" as const }
            : { status: "error" as const, error: result.error };
        } catch (cause) {
          return {
            status: "error" as const,
            error: cause instanceof Error ? cause.message : String(cause),
          };
        }
      },
    });
  }
  return queue;
}

/** Tests inject a queue without IndexedDB. */
export function setReviewQueueForTests(next: ReviewWriteQueue | null) {
  queue = next;
}
