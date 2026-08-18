"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildSessionAction,
  reportCardAction,
} from "@/features/review-session/actions";
import { routes } from "@/lib/routes";
import { getReviewQueue } from "@/features/review-session/review-queue";
import {
  canFlip,
  canGrade,
  nextPhase,
  type SessionPhase,
} from "@/features/review-session/session-machine";
import { removeReportedCardFromQueue } from "@/features/review-session/remove-reported-card";
import { getInstallationId } from "@/lib/installation-id";
import {
  displayRunSegments,
  gradeRunSegment,
  initRunSegments,
  type RunSegment,
} from "@/lib/review-session-run-status";
import { requeueInsertIndex } from "@/lib/review-session-requeue";
import type { ReportCardInput } from "@/lib/card-report";
import type { SessionCard } from "@/lib/session-builder";
import type { Grade } from "@/lib/scheduler";

export type ReviewSessionStatus = "loading" | "ready" | "error";

export type ReviewSessionInitialData =
  | { status: "ok"; queue: SessionCard[]; languageName: string }
  | { status: "error"; error: string };

export type UseReviewSessionOptions = {
  initialData?: ReviewSessionInitialData;
};

export type ReportAck =
  | { variant: "success" }
  | { variant: "error"; message: string };

export type UseReviewSessionResult = {
  status: ReviewSessionStatus;
  loadError: string | null;
  phase: SessionPhase;
  queue: SessionCard[];
  currentCard: SessionCard | null;
  languageName: string | null;
  syncError: string | null;
  pendingCount: number;
  showSyncStatus: boolean;
  gradedCount: number;
  runSegments: RunSegment[];
  reportAck: ReportAck | null;
  reportPending: boolean;
  cardExiting: boolean;
  flip: () => void;
  grade: (value: Grade) => void;
  submitReport: (input: ReportCardInput) => Promise<void>;
  retrySync: () => void;
};

const SYNC_STATUS_DELAY_MS = 500;
const REPORT_EXIT_MS = 320;

function initialStatusFromData(
  data: ReviewSessionInitialData | undefined,
): ReviewSessionStatus {
  if (!data) return "loading";
  return data.status === "ok" ? "ready" : "error";
}

function initialPhaseFromData(data: ReviewSessionInitialData | undefined): SessionPhase {
  if (!data || data.status !== "ok") return "preparing";
  return data.queue.length === 0 ? "complete" : "prompting";
}

export function useReviewSession(options: UseReviewSessionOptions = {}): UseReviewSessionResult {
  const t = useTranslations("reviewSession");
  const { initialData } = options;
  const router = useRouter();
  const [status, setStatus] = useState<ReviewSessionStatus>(() => initialStatusFromData(initialData));
  const [loadError, setLoadError] = useState<string | null>(() =>
    initialData?.status === "error" ? initialData.error : null,
  );
  const [phase, setPhase] = useState<SessionPhase>(() => initialPhaseFromData(initialData));
  const [queue, setQueue] = useState<SessionCard[]>(() =>
    initialData?.status === "ok" ? initialData.queue : [],
  );
  const [languageName, setLanguageName] = useState<string | null>(() =>
    initialData?.status === "ok" ? initialData.languageName : null,
  );
  const [sessionIndex, setSessionIndex] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [gradedCount, setGradedCount] = useState(0);
  const [runSegments, setRunSegments] = useState<RunSegment[]>(() =>
    initialData?.status === "ok" ? initRunSegments(initialData.queue) : [],
  );
  const [reportAck, setReportAck] = useState<ReportAck | null>(null);
  const [reportPending, setReportPending] = useState(false);
  const [cardExiting, setCardExiting] = useState(false);
  const shownAtRef = useRef(Date.now());
  const gradingRef = useRef(false);

  useEffect(() => {
    if (initialData) return;

    let cancelled = false;

    async function prepare() {
      try {
        const result = await buildSessionAction();
        if (cancelled) return;

        if (result.status === "error") {
          setStatus("error");
          setLoadError(result.error);
          return;
        }

        // Signed in with nothing chosen. Not an error — the learner has simply
        // not been asked yet, and the answer is the picker, not a red box.
        if (result.status === "no-language") {
          router.push(routes.chooseLanguage);
          return;
        }

        setQueue(result.queue);
        setRunSegments(initRunSegments(result.queue));
        setLanguageName(result.languageName);
        setStatus("ready");
        if (result.queue.length === 0) {
          setPhase("complete");
        } else {
          setPhase(nextPhase("preparing", "prompting"));
          shownAtRef.current = Date.now();
        }
      } catch {
        if (cancelled) return;
        setStatus("error");
        setLoadError(t('loadError'));
      }
    }

    void prepare();
    return () => {
      cancelled = true;
    };
  }, [initialData, router]);

  useEffect(() => {
    const queueClient = getReviewQueue();
    const unsubscribe = queueClient.subscribe((state) => {
      setPendingCount(state.pending);
      setSyncError(state.failed > 0 ? state.lastError : null);
    });
    void queueClient.flushAll();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (pendingCount === 0) {
      setShowSyncStatus(false);
      return;
    }

    const timer = setTimeout(() => setShowSyncStatus(true), SYNC_STATUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pendingCount]);

  const currentCard = queue[sessionIndex] ?? null;
  const visibleRunSegments = displayRunSegments(
    runSegments,
    queue,
    sessionIndex,
    currentCard?.taskId ?? null,
  );

  const flip = useCallback(() => {
    if (!canFlip(phase)) return;
    setPhase((current) => nextPhase(current, "revealed"));
  }, [phase]);

  const grade = useCallback(
    (value: Grade) => {
      if (!currentCard || !canGrade(phase) || gradingRef.current) return;

      gradingRef.current = true;
      setReportAck(null);
      const reviewedAtMs = Date.now();

      void getReviewQueue().enqueue({
        reviewId: crypto.randomUUID(),
        taskId: currentCard.taskId,
        grade: value,
        reviewedAtMs,
        latencyMs: reviewedAtMs - shownAtRef.current,
        installationId: getInstallationId(),
      });

      setGradedCount((count) => count + 1);

      const insertAt = requeueInsertIndex(sessionIndex, queue.length, value);
      let nextQueue = queue;
      if (insertAt !== null) {
        nextQueue = [
          ...queue.slice(0, insertAt),
          { ...currentCard },
          ...queue.slice(insertAt),
        ];
        setQueue(nextQueue);
      }

      gradingRef.current = false;

      setRunSegments((segments) => gradeRunSegment(segments, currentCard.taskId, value));

      const nextIndex = sessionIndex + 1;
      if (nextIndex >= nextQueue.length) {
        setPhase((current) => nextPhase(nextPhase(current, "advancing"), "complete"));
        return;
      }

      setSessionIndex(nextIndex);
      setPhase((current) => nextPhase(nextPhase(current, "advancing"), "prompting"));
      shownAtRef.current = Date.now();
    },
    [currentCard, phase, queue, sessionIndex],
  );

  const retrySync = useCallback(() => {
    void getReviewQueue().retryFailed();
  }, []);

  const submitReport = useCallback(
    async (input: ReportCardInput) => {
      if (!currentCard || reportPending || cardExiting) return;

      setReportPending(true);
      setReportAck(null);
      const outcome = await reportCardAction(currentCard.wordId, input);
      setReportPending(false);
      if (outcome.status === "error") {
        setReportAck({ variant: "error", message: outcome.error });
        return;
      }
      setReportAck({ variant: "success" });
      setCardExiting(true);
    },
    [cardExiting, currentCard, reportPending],
  );

  useEffect(() => {
    if (!cardExiting || !currentCard) return;

    const reportedWordId = currentCard.wordId;
    const timer = window.setTimeout(() => {
      const { queue: nextQueue, nextIndex } = removeReportedCardFromQueue(
        queue,
        sessionIndex,
        reportedWordId,
      );

      setCardExiting(false);
      setQueue(nextQueue);

      if (nextIndex >= nextQueue.length) {
        setPhase((current) => nextPhase(nextPhase(current, "advancing"), "complete"));
        return;
      }

      setSessionIndex(nextIndex);
      setPhase((current) => nextPhase(nextPhase(current, "advancing"), "prompting"));
      shownAtRef.current = Date.now();
    }, REPORT_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [cardExiting, currentCard, queue, sessionIndex]);

  return {
    status,
    loadError,
    phase,
    queue,
    currentCard,
    languageName,
    syncError,
    pendingCount,
    showSyncStatus,
    gradedCount,
    runSegments: visibleRunSegments,
    reportAck,
    reportPending,
    cardExiting,
    flip,
    grade,
    submitReport,
    retrySync,
  };
}
