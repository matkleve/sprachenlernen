"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildSessionAction,
} from "@/features/review-session/actions";
import { copy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";
import { getReviewQueue } from "@/features/review-session/review-queue";
import {
  canFlip,
  canGrade,
  nextPhase,
  type SessionPhase,
} from "@/features/review-session/session-machine";
import { getInstallationId } from "@/lib/installation-id";
import type { SessionCard } from "@/lib/session-builder";
import type { Grade } from "@/lib/scheduler";

export type ReviewSessionStatus = "loading" | "ready" | "error";

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
  flip: () => void;
  grade: (value: Grade) => void;
  retrySync: () => void;
};

const SYNC_STATUS_DELAY_MS = 500;

export function useReviewSession(): UseReviewSessionResult {
  const router = useRouter();
  const [status, setStatus] = useState<ReviewSessionStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("preparing");
  const [queue, setQueue] = useState<SessionCard[]>([]);
  const [languageName, setLanguageName] = useState<string | null>(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [gradedCount, setGradedCount] = useState(0);
  const shownAtRef = useRef(Date.now());
  const gradingRef = useRef(false);

  useEffect(() => {
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
        setLoadError(copy.loadError);
      }
    }

    void prepare();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const flip = useCallback(() => {
    if (!canFlip(phase)) return;
    setPhase((current) => nextPhase(current, "revealed"));
  }, [phase]);

  const grade = useCallback(
    (value: Grade) => {
      if (!currentCard || !canGrade(phase) || gradingRef.current) return;

      gradingRef.current = true;
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
      gradingRef.current = false;

      const nextIndex = sessionIndex + 1;
      if (nextIndex >= queue.length) {
        setPhase((current) => nextPhase(nextPhase(current, "advancing"), "complete"));
        return;
      }

      setSessionIndex(nextIndex);
      setPhase((current) => nextPhase(nextPhase(current, "advancing"), "prompting"));
      shownAtRef.current = Date.now();
    },
    [currentCard, phase, queue.length, sessionIndex],
  );

  const retrySync = useCallback(() => {
    void getReviewQueue().retryFailed();
  }, []);

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
    flip,
    grade,
    retrySync,
  };
}
