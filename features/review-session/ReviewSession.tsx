import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { copy } from "@/features/review-session/content";
import { ReviewCard } from "@/features/review-session/ReviewCard";
import { SessionComplete } from "@/features/review-session/SessionComplete";
import { useReviewSession } from "@/features/review-session/useReviewSession";
import { routes } from "@/lib/routes";

type ReviewSessionProps = {
  methodName: string;
};

function showsActiveCard(phase: string): boolean {
  return phase === "prompting" || phase === "revealed";
}

export function ReviewSession({ methodName }: ReviewSessionProps) {
  const {
    status,
    loadError,
    phase,
    currentCard,
    languageName,
    syncError,
    pendingCount,
    showSyncStatus,
    gradedCount,
    flip,
    grade,
    retrySync,
  } = useReviewSession();

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

      {showSyncStatus && pendingCount > 0 ? (
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {copy.syncing(pendingCount)}
        </p>
      ) : null}

      {syncError ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-danger" aria-live="polite">
            {copy.syncFailed}
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={retrySync}>
            {copy.syncRetry}
          </Button>
        </div>
      ) : null}

      {phase === "complete" ? (
        <SessionComplete gradedCount={gradedCount} pendingCount={pendingCount} />
      ) : showsActiveCard(phase) && currentCard ? (
        <ReviewCard
          card={currentCard}
          languageName={languageName}
          phase={phase}
          onFlip={flip}
          onGrade={grade}
        />
      ) : null}
    </div>
  );
}
