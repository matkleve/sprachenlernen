"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildSessionAction,
  readSessionLoopLineAction,
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
import { applyFormEcho, planFormEcho } from "@/lib/form-echo";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import type { ReportCardInput } from "@/lib/card-report";
import type { ReviewDeck } from "@/lib/review-deck";
import type { SessionCard } from "@/lib/session-builder";
import type { SessionLoopContext, SessionLoopLineView } from "@/lib/session-loop-line";
import { applyReview, type Grade, type Task } from "@/lib/scheduler";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";

export type ReviewSessionStatus = "loading" | "ready" | "error";

export type ReviewSessionInitialData =
  | {
      status: "ok";
      queue: SessionCard[];
      languageName: string;
      sessionLoopContext: SessionLoopContext;
    }
  | { status: "error"; error: string };

export type UseReviewSessionOptions = {
  initialData?: ReviewSessionInitialData;
  deck?: ReviewDeck;
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
  syncCount: number;
  gradedCount: number;
  runSegments: RunSegment[];
  loopLine: SessionLoopLineView | null;
  reportAck: ReportAck | null;
  reportPending: boolean;
  cardExiting: boolean;
  flip: () => void;
  grade: (value: Grade) => void;
  submitReport: (input: ReportCardInput) => Promise<void>;
};

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
  const { initialData, deck = "mixed" } = options;
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
  const [syncCount, setSyncCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);
  const [runSegments, setRunSegments] = useState<RunSegment[]>(() =>
    initialData?.status === "ok" ? initRunSegments(initialData.queue) : [],
  );
  const [sessionLoopContext, setSessionLoopContext] = useState<SessionLoopContext | null>(() =>
    initialData?.status === "ok" ? initialData.sessionLoopContext : null,
  );
  const [loopLine, setLoopLine] = useState<SessionLoopLineView | null>(null);
  const meaningTasksRef = useRef<Record<string, Task>>(
    initialData?.status === "ok" ? { ...initialData.sessionLoopContext.meaningTasksByTaskId } : {},
  );
  const newlyHeldLemmasRef = useRef<Set<string>>(new Set());
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
        const result = await buildSessionAction({ deck });
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
        setSessionLoopContext(result.sessionLoopContext);
        meaningTasksRef.current = { ...result.sessionLoopContext.meaningTasksByTaskId };
        newlyHeldLemmasRef.current = new Set();
        setLoopLine(null);
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
  }, [initialData, router, deck, t]);

  useEffect(() => {
    const queueClient = getReviewQueue();
    const unsubscribe = queueClient.subscribe((state) => {
      setSyncCount(state.pending + state.failed);
    });

    const flush = () => {
      void queueClient.flushAll();
    };

    flush();
    window.addEventListener("online", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") flush();
    });

    return () => {
      unsubscribe();
      window.removeEventListener("online", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

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

      if (isMeaningRecallTaskId(currentCard.taskId)) {
        const task = meaningTasksRef.current[currentCard.taskId];
        if (task) {
          const wasHeld = isTaskHeld(task);
          const result = applyReview(task, value, reviewedAtMs);
          meaningTasksRef.current[currentCard.taskId] = result.task;
          if (!wasHeld && isTaskHeld(result.task)) {
            newlyHeldLemmasRef.current.add(currentCard.lemma);
          }
        }
      }

      const insertAt = requeueInsertIndex(sessionIndex, queue.length, value);
      let nextQueue = queue;
      if (insertAt !== null) {
        nextQueue = [
          ...queue.slice(0, insertAt),
          { ...currentCard },
          ...queue.slice(insertAt),
        ];
      }

      const echoPlan = planFormEcho(nextQueue, sessionIndex);
      if (echoPlan) {
        nextQueue = applyFormEcho(nextQueue, echoPlan);
      }

      if (insertAt !== null || echoPlan) {
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

  useEffect(() => {
    if (phase !== "complete") {
      setLoopLine(null);
      return;
    }

    const newlyHeld = [...newlyHeldLemmasRef.current];
    if (newlyHeld.length === 0 || !sessionLoopContext) {
      setLoopLine(null);
      return;
    }

    let cancelled = false;
    void readSessionLoopLineAction({
      heldLemmasAtStart: sessionLoopContext.heldLemmasAtStart,
      newlyHeldLemmas: newlyHeld,
    }).then((outcome) => {
      if (!cancelled) setLoopLine(outcome.loopLine);
    });

    return () => {
      cancelled = true;
    };
  }, [phase, sessionLoopContext, gradedCount]);

  return {
    status,
    loadError,
    phase,
    queue,
    currentCard,
    languageName,
    syncCount,
    gradedCount,
    runSegments: visibleRunSegments,
    loopLine,
    reportAck,
    reportPending,
    cardExiting,
    flip,
    grade,
    submitReport,
  };
}
