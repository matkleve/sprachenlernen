"use client";

import { useTranslations } from "next-intl";

import { TextLink } from "@/components/ui/TextLink";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SessionRunStatusStrip } from "@/features/review-session/SessionRunStatusStrip";
import { ReviewCard } from "@/features/review-session/ReviewCard";
import { SessionComplete } from "@/features/review-session/SessionComplete";
import { useReviewSession, type ReviewSessionInitialData } from "@/features/review-session/useReviewSession";
import { routes } from "@/lib/routes";
import type { ReviewDeck } from "@/lib/review-deck";
import { cn } from "@/lib/utils";

type ReviewSessionProps = {
  methodName: string;
  /** Mobile one-screen layout: no page scroll, tighter vertical rhythm. */
  compact?: boolean;
  deck?: ReviewDeck;
  /** Server-built queue — first card renders with the page, no client prepare step. */
  initialData?: ReviewSessionInitialData;
};

function showsActiveCard(phase: string): boolean {
  return phase === "prompting" || phase === "revealed";
}

export function ReviewSession({ methodName, compact = false, deck = "mixed", initialData }: ReviewSessionProps) {
  const t = useTranslations("reviewSession");
  const {
    status,
    loadError,
    phase,
    currentCard,
    languageName,
    syncCount,
    gradedCount,
    runSegments,
    reportAck,
    reportPending,
    cardExiting,
    flip,
    grade,
    submitReport,
  } = useReviewSession({ initialData, deck });

  const rootClass = cn(
    compact ? "flex min-h-0 flex-1 flex-col md:mt-page-content" : "mt-page-content",
  );

  if (status === "loading") {
    return (
      <p className={cn(rootClass, "text-base text-muted")} aria-live="polite">
        {t('loading')}
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className={rootClass}>
        <p className="text-base text-danger" aria-live="polite">
          {loadError ?? t('loadError')}
        </p>
        <TextLink
          href={routes.methods}
          tone="muted"
          size="sm"
          className="mt-4 hidden md:inline-block"
        >
          ← {t('backToMethods')}
        </TextLink>
      </div>
    );
  }

  const sessionHeader =
    compact && showsActiveCard(phase) && currentCard ? (
      <div className="flex shrink-0 items-baseline justify-between gap-3 text-sm text-muted">
        <span className="min-w-0 truncate">{methodName}</span>
        <span className="shrink-0 tabular-nums" aria-live="polite">
          {t('progress', { position: currentCard.position, total: currentCard.total })}
        </span>
      </div>
    ) : (
      <p className={cn("text-sm text-muted", compact && "shrink-0")}>{methodName}</p>
    );

  return (
    <div className={rootClass}>
      {sessionHeader}

      {reportAck?.variant === "success" ? (
        <StatusBanner
          variant="success"
          title={t("reportSuccessTitle")}
          body={t("reportSuccessBody")}
          className={cn(compact ? "mt-1 shrink-0" : "mt-2")}
        />
      ) : null}

      {reportAck?.variant === "error" ? (
        <p
          className={cn(
            "text-sm text-danger",
            compact ? "mt-1 shrink-0" : "mt-2",
          )}
          role="status"
          aria-live="polite"
        >
          {reportAck.message}
        </p>
      ) : null}

      {phase === "complete" ? (
        <SessionComplete
          gradedCount={gradedCount}
          pendingCount={syncCount}
          compact={compact}
        />
      ) : showsActiveCard(phase) && currentCard ? (
        <div className={cn(compact && "flex min-h-0 flex-1 flex-col")}>
          {runSegments.length > 0 ? (
            <SessionRunStatusStrip
              segments={runSegments}
              className={cn(
                compact ? "mb-2 shrink-0 md:mb-3" : "mb-3",
              )}
            />
          ) : null}
          <ReviewCard
            key={currentCard.wordId}
            card={currentCard}
            languageName={languageName}
            phase={phase}
            onFlip={flip}
            onGrade={grade}
            onSubmitReport={submitReport}
            reportPending={reportPending}
            exiting={cardExiting}
            compact={compact}
          />
        </div>
      ) : null}
    </div>
  );
}
