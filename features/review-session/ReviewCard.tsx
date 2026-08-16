"use client";

import { Flag } from "lucide-react";
import { useRef, useState } from "react";

import { GradeButton } from "@/components/ui/GradeButton";
import { IconButton } from "@/components/ui/IconButton";
import { PressableCard } from "@/components/ui/PressableCard";
import { CardReportPopover } from "@/features/review-session/CardReportPopover";
import { copy } from "@/features/review-session/content";
import {
  canFlip,
  canGrade,
  showsBack,
} from "@/features/review-session/session-machine";
import type { ReportCardInput } from "@/lib/card-report";
import type { SessionCard } from "@/lib/session-builder";
import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import { paradigmCellLabel } from "@/lib/paradigm-cells";
import { GRADES, type Grade } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

type ReviewCardProps = {
  card: SessionCard;
  languageName: string | null;
  phase: Parameters<typeof canGrade>[0];
  onFlip: () => void;
  onGrade: (grade: Grade) => void;
  onSubmitReport: (input: ReportCardInput) => Promise<void>;
  reportPending?: boolean;
  /** Hides progress line and tightens spacing for mobile one-screen layout. */
  compact?: boolean;
};

export function ReviewCard({
  card,
  languageName,
  phase,
  onFlip,
  onGrade,
  onSubmitReport,
  reportPending = false,
  compact = false,
}: ReviewCardProps) {
  const flagRef = useRef<HTMLButtonElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const flipEnabled = canFlip(phase);
  const gradesEnabled = canGrade(phase);
  const revealBack = showsBack(phase);
  const isFormRecall = isFormRecallTaskId(card.taskId);
  const gradePrompt = isFormRecall ? copy.formRecallPrompt : copy.prompt;
  const cell = card.paradigmCell ? paradigmCellLabel(card.paradigmCell) : null;

  const handleSubmitReport = async (input: ReportCardInput) => {
    await onSubmitReport(input);
    setReportOpen(false);
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md",
        compact && "flex min-h-0 flex-1 flex-col justify-between pt-2 md:pt-0",
      )}
    >
      {!compact ? (
        <p className="text-sm text-muted" aria-live="polite">
          {copy.progress(card.position, card.total)}
        </p>
      ) : null}

      <div className={cn("relative", compact && "flex min-h-0 flex-1 flex-col")}>
        <IconButton
          ref={flagRef}
          type="button"
          size="sm"
          pending={reportPending}
          pendingPolicy="none"
          onClick={() => setReportOpen((open) => !open)}
          aria-label={copy.report}
          aria-expanded={reportOpen}
          aria-haspopup="dialog"
          className="absolute top-3 right-3 z-10 text-muted hover:text-ink"
        >
          <Flag className="size-4" aria-hidden />
        </IconButton>

        <CardReportPopover
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={handleSubmitReport}
          pending={reportPending}
          triggerRef={flagRef}
        />

        <PressableCard
          onClick={onFlip}
          interactive={flipEnabled}
          aria-expanded={revealBack}
          aria-label={flipEnabled ? copy.flipHint : undefined}
          className={cn(
            compact ? "flex min-h-0 flex-1 flex-col justify-center p-5 md:mt-6 md:flex-none md:p-8" : "mt-6 p-8",
          )}
        >
          {languageName && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {copy.languageLabel(languageName)}
            </p>
          )}

          <p
            className={cn(
              compact ? "text-xl md:text-2xl" : "text-2xl",
              "font-semibold text-ink transition-transform duration-300",
              languageName ? "mt-1 md:mt-2" : "",
              revealBack && "scale-95 opacity-80",
            )}
          >
            {card.front}
          </p>

          {cell && (
            <p className={cn("font-medium text-ink", compact ? "mt-2 text-sm md:text-base" : "mt-3 text-base")}>
              {copy.cellLabel(cell)}
            </p>
          )}

          {isFormRecall && (
            <p className={cn("text-muted", compact ? "mt-1 text-xs md:mt-2 md:text-sm" : "mt-2 text-sm")}>
              {copy.formRecallInstruction(languageName)}
            </p>
          )}

          {revealBack && (
            <p
              className={cn(
                "border-t border-line text-muted",
                compact ? "mt-3 pt-3 text-sm md:mt-4 md:pt-4 md:text-base" : "mt-4 pt-4 text-base",
              )}
            >
              {card.back}
            </p>
          )}

          {flipEnabled && (
            <p className="pointer-events-none absolute right-4 bottom-3 flex items-center gap-1 text-xs text-muted">
              <span aria-hidden className="text-sm leading-none">
                ↻
              </span>
              {copy.flipHint}
            </p>
          )}
        </PressableCard>
      </div>

      {gradesEnabled && (
        <div
          className={cn(
            compact && "mt-2 shrink-0 pb-3 md:mt-6 md:pb-0",
            !compact && "mt-6",
          )}
        >
          <p className={cn("text-muted", compact ? "text-xs md:text-sm" : "text-sm")}>
            {gradePrompt}
          </p>

          <div
            className={cn(
              "grid w-full grid-cols-4",
              compact ? "mt-1.5 gap-1.5 md:mt-4 md:gap-2" : "mt-4 gap-2",
            )}
          >
            {GRADES.map((grade) => (
              <GradeButton
                key={grade}
                grade={grade}
                onClick={() => onGrade(grade)}
                className={compact ? "h-7 px-2 text-xs md:h-8 md:px-3 md:text-sm" : undefined}
              >
                {copy[grade]}
              </GradeButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
