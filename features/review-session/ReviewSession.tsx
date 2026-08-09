"use client";

import Link from "next/link";

import { copy } from "@/features/review-session/content";
import { ReviewCard } from "@/features/review-session/ReviewCard";
import { SessionComplete } from "@/features/review-session/SessionComplete";
import { useReviewSession } from "@/features/review-session/useReviewSession";
import { routes } from "@/lib/routes";

type ReviewSessionProps = {
  methodName: string;
};

function showsActiveCard(phase: string): boolean {
  return phase === "prompting" || phase === "persisting" || phase === "revealed";
}

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
      <div className="mt-page-content">
        <p className="text-base text-danger" aria-live="polite">
          {loadError ?? copy.loadError}
        </p>
        <Link href={routes.methods} className="mt-4 inline-block text-sm font-medium text-muted hover:text-ink">
          ← {copy.backToMethods}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-page-content">
      <p className="text-sm text-muted">{methodName}</p>

      {phase === "complete" ? (
        <SessionComplete gradedCount={gradedCount} />
      ) : showsActiveCard(phase) && currentCard ? (
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
