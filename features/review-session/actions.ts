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
import { buildFormCellCatalog } from "@/lib/form-cell-catalog";
import { heldLemmaSet } from "@/lib/content-gap";
import { firstReviewTimesByTaskId } from "@/lib/form-introduction";
import { isFormCellTaskId } from "@/lib/form-cell-task-id";
import { parseFrequencyList } from "@/lib/lexicon";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { StarterCard } from "@/lib/starter-deck";
import { buildSession, type SessionCard } from "@/lib/session-builder";
import {
  buildSessionLoopLine,
  type SessionLoopContext,
  type SessionLoopLineView,
} from "@/lib/session-loop-line";
import { loadLexiconForLanguage, loadPersistedSources } from "@/features/content/language-runtime";
import { listLearnerSourcesForLanguage } from "@/lib/db/content-sources";
import { newTask, type Task } from "@/lib/scheduler";
import esLemma from "@/data/lemma/es.json";
import itLemma from "@/data/lemma/it.json";
import { loadLemmaTable } from "@/lib/lemma-table";
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
  | { status: "ok"; queue: SessionCard[]; languageName: string; sessionLoopContext: SessionLoopContext }
  /** Signed in, no language chosen — the caller sends them to the picker. */
  | { status: "no-language" }
  | { status: "error"; error: string };

export type ReadSessionLoopLineOutcome = {
  loopLine: SessionLoopLineView | null;
};

export async function readSessionLoopLineAction(input: {
  heldLemmasAtStart: readonly string[];
  newlyHeldLemmas: readonly string[];
}): Promise<ReadSessionLoopLineOutcome> {
  try {
    const pool = await poolForActiveLanguage();
    if (pool.status !== "ok") return { loopLine: null };

    const languageCode = pool.languageCodes[0] ?? "es";
    const lexicon = loadLexiconForLanguage(languageCode);
    if (!lexicon) return { loopLine: null };

    const fixture = loadPersistedSources(languageCode);
    const learner = await listLearnerSourcesForLanguage(languageCode);
    const sources = learner.status === "ok" ? [...fixture, ...learner.sources] : fixture;

    const loopLine = buildSessionLoopLine({
      sources,
      lexicon,
      heldLemmasBefore: new Set(input.heldLemmasAtStart),
      newlyHeldLemmas: input.newlyHeldLemmas,
    });
    return { loopLine };
  } catch {
    return { loopLine: null };
  }
}

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
    const lemmaMeta = lemmaMetaForLanguage(activeCode ?? "es");
    const formCellPool =
      deck === "form" ? formCellPoolForLanguage(activeCode ?? "es", poolCards, lemmaMeta) : undefined;
    const firstCellReviews = firstReviewTimesByTaskId(
      reviewsResult.reviews.filter((row) => isFormCellTaskId(row.taskId)),
    );

    const queue = localizeSessionCards(
      buildSession(schedulable, tasksByTaskId, now, undefined, {
        priorityLemmas,
        deck,
        sampling,
        lemmaMeta,
        formCellPool,
        firstCellReviews,
      }),
      spoken.spokenLanguage,
    ).map((card) => attachFormExplanation(card, activeCode ?? "es", poolCards, tasksByTaskId));

    const heldLemmasAtStart = [...heldLemmaSet(meaningCards, tasksByTaskId)];
    const meaningTasksByTaskId: Record<string, Task> = {};
    for (const card of queue) {
      if (!isMeaningRecallTaskId(card.taskId)) continue;
      meaningTasksByTaskId[card.taskId] =
        tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    }

    return {
      status: "ok",
      queue,
      languageName,
      sessionLoopContext: { heldLemmasAtStart, meaningTasksByTaskId },
    };
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

function lemmaMetaForLanguage(languageCode: string) {
  const raw =
    languageCode === "it" ? itLemma : languageCode === "es" ? esLemma : undefined;
  if (!raw) return undefined;
  return loadLemmaTable(raw, languageCode).table?.lemmas;
}

function formCellPoolForLanguage(
  languageCode: string,
  poolCards: StarterCard[],
  lemmaMeta: ReturnType<typeof lemmaMetaForLanguage>,
) {
  if (!lemmaMeta) return undefined;
  const raw = languageCode === "it" ? itLemma : languageCode === "es" ? esLemma : undefined;
  if (!raw) return undefined;
  const table = loadLemmaTable(raw, languageCode).table;
  if (!table) return undefined;

  try {
    const frequency = parseFrequencyList(
      readFileSync(join(process.cwd(), `data/frequency/${languageCode}.txt`), "utf8"),
    );
    return buildFormCellCatalog({
      languageCode,
      pool: poolCards,
      lemmaTable: table,
      frequency,
    });
  } catch {
    return undefined;
  }
}
