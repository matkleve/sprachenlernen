"use server";

import { cookies } from "next/headers";

import { appendReview } from "@/lib/db/review-log";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { flagCardContent, listFlaggedWordIds } from "@/lib/db/card-content-flags";
import type { ReportCardInput } from "@/lib/card-report";
import { getSpokenLanguage } from "@/lib/db/profiles";
import {
  catalogueLoadFailed,
  logHandledErrorFromRequest,
  sessionBuildFailed,
} from "@/lib/errors";
import { buildSession, type SessionCard } from "@/lib/session-builder";
import { filterSchedulableCards } from "@/lib/form-recall-staging";
import { isFormRecallTaskId, isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { buildFormCellExplanation } from "@/lib/form-cell-explanation";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { buildSamplingContext } from "@/lib/sampling-context";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { languageLabel } from "@/lib/languages";
import { localizeSessionCards } from "@/lib/localize-card-description";
import { parseGapSetCookie, GAP_SET_COOKIE } from "@/lib/gap-set-cookie";
import { parseReviewDeck, type ReviewDeck } from "@/lib/review-deck";
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

export async function reportCardAction(wordId: string, input: ReportCardInput = {}) {
  return flagCardContent(wordId, input);
}

export async function buildSessionAction(input?: {
  deck?: ReviewDeck | string | null;
}): Promise<BuildSessionOutcome> {
  const deck = parseReviewDeck(input?.deck ?? undefined);
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

    const spoken = await getSpokenLanguage();
    if (spoken.status === "error") {
      return { status: "error", error: spoken.error };
    }

    const flagged = await listFlaggedWordIds(spoken.spokenLanguage);
    if (flagged.status === "error") {
      return { status: "error", error: flagged.error };
    }

    const flaggedSet = new Set(flagged.wordIds);
    const poolCards = pool.cards.filter((card) => !flaggedSet.has(card.wordId));

    const taskIds = poolCards.map((card) => card.taskId);
    const statesResult = await listTaskStatesForTaskIds(taskIds);
    if (statesResult.status === "error") {
      const handled = sessionBuildFailed(statesResult.error);
      return { status: "error", error: handled.userMessage };
    }

    const tasksByTaskId = tasksByTaskIdForCards(poolCards, statesResult.rows);
    const schedulable = filterSchedulableCards(poolCards, tasksByTaskId);

    const now = Date.now();
    const reviewsResult = await listReviewsForTaskIds(poolCards.map((card) => card.taskId));
    if (reviewsResult.status === "error") {
      const handled = sessionBuildFailed(reviewsResult.error);
      return { status: "error", error: handled.userMessage };
    }

    const meaningCards = poolCards.filter((card) => isMeaningRecallTaskId(card.taskId));
    const sampling = buildSamplingContext(
      reviewsResult.reviews.map((row) => ({
        taskId: row.taskId,
        grade: row.grade,
        reviewedAt: row.reviewedAt,
      })),
      meaningCards,
      tasksByTaskId,
      now,
    );

    const cookieStore = await cookies();
    const gapSet = parseGapSetCookie(cookieStore.get(GAP_SET_COOKIE)?.value);
    const priorityLemmas = gapSet ? new Set(gapSet.lemmas) : undefined;
    const queue = localizeSessionCards(
      buildSession(schedulable, tasksByTaskId, now, undefined, {
        priorityLemmas,
        deck,
        sampling,
      }),
      spoken.spokenLanguage,
    ).map((card) => attachFormExplanation(card, activeCode ?? "es", poolCards, tasksByTaskId));
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

function attachFormExplanation(
  card: SessionCard,
  languageCode: string,
  pool: Parameters<typeof buildFormCellExplanation>[0]["pool"],
  tasksByTaskId: Record<string, import("@/lib/scheduler").Task>,
): SessionCard {
  if (!isFormRecallTaskId(card.taskId) || !card.paradigmCell || !card.back) return card;
  const explanation = buildFormCellExplanation({
    languageCode,
    wordId: card.wordId,
    paradigmCell: card.paradigmCell,
    surfaceForm: card.back,
    pool,
    tasksByTaskId,
  });
  return explanation ? { ...card, formExplanation: explanation } : card;
}
