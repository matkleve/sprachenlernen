"use client";

import { copy } from "@/features/review-session/content";
import { ReviewCard } from "@/features/review-session/ReviewCard";
import { SessionComplete } from "@/features/review-session/SessionComplete";
import { useReviewSession } from "@/features/review-session/useReviewSession";

type ReviewSessionProps = {
  methodName: string;
};

export function ReviewSession({ methodName }: ReviewSessionProps) {
  const { status, loadError, phase, currentCard, persistError, gradedCount, grade } =
    useReviewSession();

  if (status === "loading") {
    return (
      <p className="mt-page-content text-base text-muted" aria-live="polite">
        {copy.loading}
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="mt-page-content text-base text-danger" aria-live="polite">
        {loadError ?? copy.loadError}
      </p>
    );
  }

  return (
    <div className="mt-page-content">
      <p className="text-sm text-muted">{methodName}</p>

      {phase === "complete" ? (
        <SessionComplete gradedCount={gradedCount} />
      ) : currentCard ? (
        <ReviewCard
          card={currentCard}
          phase={phase}
          persistError={persistError}
          onGrade={(value) => void grade(value)}
        />
      ) : null}
    </div>
  );
}
