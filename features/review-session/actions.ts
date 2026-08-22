"use server";

import { cookies } from "next/headers";

import { appendReview } from "@/lib/db/review-log";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { flagCardContent, listFlaggedWordIds } from "@/lib/db/card-content-flags";
import type { ReportCardInput } from "@/lib/card-report";
import {
  loadExampleSentenceBank,
  pickExampleSentence,
} from "@/lib/card-example-sentence";
import { appendCoverageSnapshots, listCoverageHistoryForLanguage } from "@/lib/db/coverage-history";
import { coverageSnapshotsToAppend, mapLatestPercentBySource } from "@/lib/coverage-snapshots";
import { heldLemmaSet } from "@/lib/content-gap";
import { loadPersistedSources } from "@/features/content/language-runtime";
import { listLearnerSourcesForLanguage } from "@/lib/db/content-sources";
import {
  computeSessionLoopPayoff,
  type SessionGrade,
  type SessionLoopPayoff,
} from "@/lib/session-loop-payoff";
import { sentenceTranslationKey } from "@/lib/description-keys";
import { getSpokenLanguage } from "@/lib/db/profiles";
import { resolveDescription } from "@/lib/gloss-resolver";
import {
  catalogueLoadFailed,
  logHandledErrorFromRequest,
  sessionBuildFailed,
} from "@/lib/errors";
import { buildSession, DEFAULT_SESSION_LENGTH, type SessionCard } from "@/lib/session-builder";
import { filterSchedulableCards } from "@/lib/form-recall-staging";
import { getLearnerWorld } from "@/lib/db/learner-world";
import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import { buildSamplingContext } from "@/lib/sampling-context";
import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import { buildFormCellExplanation } from "@/lib/form-cell-explanation";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { languageLabel } from "@/lib/languages";
import { localizeSessionCards } from "@/lib/localize-card-description";
import { loadLexiconForLanguage } from "@/lib/shipped-language";
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
  | { status: "ok"; queue: SessionCard[]; languageName: string; heldLemmasAtStart: readonly string[] }
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
  const sessionLength = DEFAULT_SESSION_LENGTH;
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
    const schedulable = filterSchedulableCards(poolCards);
    const now = Date.now();
    const languages = await listLearningLanguages();
    const activeLanguageCode =
      languages.status === "ok"
        ? activeLanguageOf(languages.languages) ?? activeCode ?? ""
        : activeCode ?? "";
    const worldOutcome = activeLanguageCode
      ? await getLearnerWorld(activeLanguageCode)
      : { status: "ok" as const, world: { worldId: "general" as const, setAt: null }, hasRow: false };
    const activeWorld =
      worldOutcome.status === "ok" ? worldOutcome.world.worldId : ("general" as const);
    const sampling = {
      ...buildSamplingContext(poolCards, tasksByTaskId, statesResult.rows, now),
      activeWorld,
    };
    const cookieStore = await cookies();
    const gapSet = parseGapSetCookie(cookieStore.get(GAP_SET_COOKIE)?.value);
    const priorityLemmas = gapSet ? new Set(gapSet.lemmas) : undefined;
    const queue = localizeSessionCards(
      buildSession(schedulable, tasksByTaskId, now, sessionLength, {
        priorityLemmas,
        deck,
        sampling,
      }),
      spoken.spokenLanguage,
    )
      .map((card) => attachFormExplanation(card, activeCode ?? "es", poolCards, tasksByTaskId))
      .map((card) =>
        attachExampleSentence(
          card,
          activeCode ?? "es",
          activeWorld,
          spoken.spokenLanguage,
          meaningRecallHeldLemmas(poolCards, tasksByTaskId),
          now,
        ),
      );
    return {
      status: "ok",
      queue,
      languageName,
      heldLemmasAtStart: [...meaningRecallHeldLemmas(poolCards, tasksByTaskId)],
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

export type SessionLoopPayoffOutcome =
  | { status: "ok"; payoff: SessionLoopPayoff }
  | { status: "no-language" }
  | { status: "error"; error: string };

export async function sessionLoopPayoffAction(input: {
  heldLemmasAtStart: readonly string[];
  sessionGrades: readonly SessionGrade[];
}): Promise<SessionLoopPayoffOutcome> {
  try {
    const pool = await poolForActiveLanguage();
    if (pool.status === "no-language") return { status: "no-language" };
    if (pool.status === "error") {
      return { status: "error", error: pool.error };
    }

    const languageCode = pool.languageCodes[0] ?? "es";
    const lexicon = loadLexiconForLanguage(languageCode);
    if (!lexicon) {
      return { status: "error", error: "Could not load language data." };
    }

    const taskIds = pool.cards.map((card) => card.taskId);
    const statesResult = await listTaskStatesForTaskIds(taskIds);
    if (statesResult.status === "error") {
      return { status: "error", error: statesResult.error };
    }

    const tasksByTaskId = tasksByTaskIdForCards(pool.cards, statesResult.rows);
    const meaningCards = pool.cards.filter((card) => !isFormRecallTaskId(card.taskId));
    const heldAtStart = new Set(input.heldLemmasAtStart);

    const fixture = loadPersistedSources(languageCode);
    const learner = await listLearnerSourcesForLanguage(languageCode);
    const sources =
      learner.status === "ok" ? [...fixture, ...learner.sources] : fixture;

    const payoff = computeSessionLoopPayoff(
      meaningCards,
      tasksByTaskId,
      heldAtStart,
      input.sessionGrades,
      sources,
      lexicon,
    );

    if (payoff.kind === "payoff" && payoff.newlyHeldCount > 0) {
      const historyResult = await listCoverageHistoryForLanguage(languageCode);
      const latest =
        historyResult.status === "ok"
          ? mapLatestPercentBySource(historyResult.rows)
          : new Map<string, number>();

      const heldAfter = new Set(heldAtStart);
      for (const lemma of payoff.newlyHeldLemmas) heldAfter.add(lemma);

      const snapshots = coverageSnapshotsToAppend(sources, lexicon, heldAfter, latest);
      if (snapshots.length > 0) {
        await appendCoverageSnapshots(languageCode, snapshots);
      }
    }

    return { status: "ok", payoff };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Could not compute session payoff.";
    return { status: "error", error: message };
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

function meaningRecallHeldLemmas(
  pool: Parameters<typeof heldLemmaSet>[0],
  tasksByTaskId: Record<string, import("@/lib/scheduler").Task>,
): ReadonlySet<string> {
  const meaningCards = pool.filter((card) => !isFormRecallTaskId(card.taskId));
  return heldLemmaSet(meaningCards, tasksByTaskId);
}

function attachExampleSentence(
  card: SessionCard,
  languageCode: string,
  activeWorld: import("@/lib/learner-world").LearnerWorldId,
  spokenLanguage: string,
  heldLemmas: ReadonlySet<string>,
  now: number,
): SessionCard {
  if (isFormRecallTaskId(card.taskId)) return card;

  const bank = loadExampleSentenceBank(languageCode);
  const lexicon = loadLexiconForLanguage(languageCode);
  if (!bank || !lexicon) return card;

  const dayKey = new Date(now).toISOString().slice(0, 10);
  const pick = pickExampleSentence({
    bank,
    wordId: card.wordId,
    heldLemmas,
    lexicon,
    activeWorld,
    salt: `${dayKey}:${card.taskId}`,
  });
  if (!pick) return card;

  return {
    ...card,
    exampleSentence: {
      ...pick,
      translation: resolveDescription(
        sentenceTranslationKey(pick.id),
        spokenLanguage,
        pick.translation,
      ),
    },
  };
}
