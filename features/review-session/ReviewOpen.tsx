"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { appendReviewAction } from "@/features/review-session/actions";
import { getInstallationId } from "@/lib/installation-id";
import { GRADES, type Grade } from "@/lib/scheduler";

import { copy } from "./content";

type ReviewOpenProps = {
  methodName: string;
};

type PersistStatus = "idle" | "saving" | "saved" | "error";

/**
 * Minimal open session — one card, four grades, append-only persistence (T-B2).
 * Opens immediately; no duration picker. Queue and projections are T-B1.
 */
export function ReviewOpen({ methodName }: ReviewOpenProps) {
  const [lastGrade, setLastGrade] = useState<Grade | null>(null);
  const [persistStatus, setPersistStatus] = useState<PersistStatus>("idle");
  const shownAtRef = useRef(Date.now());

  async function handleGrade(grade: Grade) {
    setLastGrade(grade);
    setPersistStatus("saving");

    const reviewedAtMs = Date.now();
    const result = await appendReviewAction({
      taskId: copy.demoTaskId,
      grade,
      reviewedAtMs,
      latencyMs: reviewedAtMs - shownAtRef.current,
      installationId: getInstallationId(),
    });

    setPersistStatus(result.status === "appended" ? "saved" : "error");
  }

  const isSaving = persistStatus === "saving";

  return (
    <div className="mt-page-content">
      <p className="text-sm text-muted">{methodName}</p>

      <div className="mt-6 rounded-card border border-line bg-surface p-8 text-center shadow-soft">
        <p className="text-2xl font-semibold text-ink">{copy.demoCard.front}</p>
        {lastGrade && (
          <p className="mt-4 text-base text-muted">{copy.demoCard.back}</p>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">{copy.prompt}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {GRADES.map((grade) => (
          <Button
            key={grade}
            type="button"
            variant={grade === "again" ? "danger" : "secondary"}
            disabled={isSaving}
            onClick={() => handleGrade(grade)}
          >
            {copy[grade]}
          </Button>
        ))}
      </div>

      {persistStatus === "saving" && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {copy.saving}
        </p>
      )}
      {persistStatus === "saved" && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {copy.graded}
        </p>
      )}
      {persistStatus === "error" && (
        <p className="mt-6 text-sm text-danger" aria-live="polite">
          {copy.saveError}
        </p>
      )}
    </div>
  );
}
