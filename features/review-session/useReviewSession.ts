"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  appendReviewAction,
  buildSessionAction,
} from "@/features/review-session/actions";
import {
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
  persistError: string | null;
  gradedCount: number;
  grade: (value: Grade) => Promise<void>;
};

export function useReviewSession(): UseReviewSessionResult {
  const [status, setStatus] = useState<ReviewSessionStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("preparing");
  const [queue, setQueue] = useState<SessionCard[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [gradedCount, setGradedCount] = useState(0);
  const shownAtRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      const result = await buildSessionAction();
      if (cancelled) return;

      if (result.status === "error") {
        setStatus("error");
        setLoadError(result.error);
        return;
      }

      setQueue(result.queue);
      setStatus("ready");
      if (result.queue.length === 0) {
        setPhase("complete");
      } else {
        setPhase(nextPhase("preparing", "prompting"));
        shownAtRef.current = Date.now();
      }
    }

    void prepare();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentCard = queue[sessionIndex] ?? null;

  const advance = useCallback(() => {
    setPersistError(null);
    const nextIndex = sessionIndex + 1;
    if (nextIndex >= queue.length) {
      setPhase(nextPhase("advancing", "complete"));
      return;
    }
    setSessionIndex(nextIndex);
    setPhase(nextPhase("advancing", "prompting"));
    shownAtRef.current = Date.now();
  }, [queue.length, sessionIndex]);

  useEffect(() => {
    if (phase !== "revealed") return;
    const timer = window.setTimeout(() => {
      setPhase((current) => nextPhase(current, "advancing"));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "advancing") return;
    advance();
  }, [phase, advance]);

  const grade = useCallback(
    async (value: Grade) => {
      if (!currentCard || !canGrade(phase)) return;

      setPersistError(null);
      setPhase((current) => nextPhase(current, "persisting"));

      const reviewedAtMs = Date.now();
      const result = await appendReviewAction({
        taskId: currentCard.taskId,
        grade: value,
        reviewedAtMs,
        latencyMs: reviewedAtMs - shownAtRef.current,
        installationId: getInstallationId(),
      });

      if (result.status === "error") {
        setPersistError(result.error);
        setPhase((current) => nextPhase(current, "prompting"));
        return;
      }

      setGradedCount((count) => count + 1);
      setPhase((current) => nextPhase(current, "revealed"));
    },
    [currentCard, phase],
  );

  return {
    status,
    loadError,
    phase,
    queue,
    currentCard,
    persistError,
    gradedCount,
    grade,
  };
}
