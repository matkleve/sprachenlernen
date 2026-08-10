"use server";

import { appendReview, listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { AppError } from "@/lib/error-boundary";
import { catalogueLoadFailed, sessionBuildFailed } from "@/lib/errors";
import { buildSession, type SessionCard } from "@/lib/session-builder";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
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
  | { status: "error"; error: string };

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  es: "Spanish",
  it: "Italian",
};

export async function buildSessionAction(): Promise<BuildSessionOutcome> {
  try {
    const deckResult = loadSpanishMeaningRecallDeck();
    if (deckResult.status === "error") {
      const handled = catalogueLoadFailed(deckResult.errors);
      return { status: "error", error: handled.userMessage };
    }

    const languageName =
      LANGUAGE_DISPLAY_NAMES[deckResult.deck.language] ?? deckResult.deck.language;

    const taskIds = deckResult.deck.cards.map((card) => card.taskId);
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

    const queue = buildSession(deckResult.deck.cards, reviewsByTaskId, Date.now());
    return { status: "ok", queue, languageName };
  } catch (cause) {
    const handled = sessionBuildFailed(
      cause instanceof Error ? cause.message : String(cause),
    );
    throw new AppError(handled);
  }
}
