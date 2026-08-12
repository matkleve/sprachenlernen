"use client";

import { useTransition } from "react";

import { TextLink } from "@/components/ui/TextLink";
import { Button } from "@/components/ui/Button";
import { copy } from "@/features/review-session/content";
import { ReviewCard } from "@/features/review-session/ReviewCard";
import { SessionComplete } from "@/features/review-session/SessionComplete";
import { useReviewSession } from "@/features/review-session/useReviewSession";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ReviewSessionProps = {
  methodName: string;
  /** Mobile one-screen layout: no page scroll, tighter vertical rhythm. */
  compact?: boolean;
};

function showsActiveCard(phase: string): boolean {
  return phase === "prompting" || phase === "revealed";
}

export function ReviewSession({ methodName, compact = false }: ReviewSessionProps) {
  const [retryPending, startRetry] = useTransition();
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
    reportMessage,
    reportPending,
    flip,
    grade,
    report,
    retrySync,
  } = useReviewSession();

  const rootClass = cn(
    compact ? "flex min-h-0 flex-1 flex-col md:mt-page-content" : "mt-page-content",
  );

  if (status === "loading") {
    return (
      <p className={cn(rootClass, "text-base text-muted")} aria-live="polite">
        {copy.loading}
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className={rootClass}>
        <p className="text-base text-danger" aria-live="polite">
          {loadError ?? copy.loadError}
        </p>
        <TextLink href={routes.methods} tone="muted" size="sm" className="mt-4 inline-block">
          ← {copy.backToMethods}
        </TextLink>
      </div>
    );
  }

  const sessionHeader =
    compact && showsActiveCard(phase) && currentCard ? (
      <div className="flex shrink-0 items-baseline justify-between gap-3 text-sm text-muted">
        <span className="min-w-0 truncate">{methodName}</span>
        <span className="shrink-0 tabular-nums" aria-live="polite">
          {copy.progress(currentCard.position, currentCard.total)}
        </span>
      </div>
    ) : (
      <p className={cn("text-sm text-muted", compact && "shrink-0")}>{methodName}</p>
    );

  return (
    <div className={rootClass}>
      {sessionHeader}

      {showSyncStatus && pendingCount > 0 ? (
        <p
          className={cn(
            "text-sm text-muted",
            compact ? "mt-1 shrink-0" : "mt-2",
          )}
          aria-live="polite"
        >
          {copy.syncing(pendingCount)}
        </p>
      ) : null}

      {syncError ? (
        <div className={cn("flex flex-wrap items-center gap-3", compact ? "mt-1 shrink-0" : "mt-2")}>
          <p className="text-sm text-danger" aria-live="polite">
            {copy.syncFailed}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            pending={retryPending}
            onClick={() => startRetry(() => retrySync())}
          >
            {copy.syncRetry}
          </Button>
        </div>
      ) : null}

      {reportMessage ? (
        <p
          className={cn(
            "text-sm text-ink",
            compact ? "mt-1 shrink-0" : "mt-2",
          )}
          role="status"
          aria-live="polite"
        >
          {reportMessage}
        </p>
      ) : null}

      {phase === "complete" ? (
        <SessionComplete
          gradedCount={gradedCount}
          pendingCount={pendingCount}
          compact={compact}
        />
      ) : showsActiveCard(phase) && currentCard ? (
        <ReviewCard
          card={currentCard}
          languageName={languageName}
          phase={phase}
          onFlip={flip}
          onGrade={grade}
          onReport={report}
          reportPending={reportPending}
          compact={compact}
        />
      ) : null}
    </div>
  );
}
