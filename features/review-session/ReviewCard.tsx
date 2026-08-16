"use client";

import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";

import { GradeButton } from "@/components/ui/GradeButton";
import { IconButton } from "@/components/ui/IconButton";
import { PressableCard } from "@/components/ui/PressableCard";
import {
  canFlip,
  canGrade,
  showsBack,
} from "@/features/review-session/session-machine";
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
  onReport: () => void;
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
  onReport,
  reportPending = false,
  compact = false,
}: ReviewCardProps) {
  const t = useTranslations("reviewSession");
  const flipEnabled = canFlip(phase);
  const gradesEnabled = canGrade(phase);
  const revealBack = showsBack(phase);
  const isFormRecall = isFormRecallTaskId(card.taskId);
  const gradePrompt = isFormRecall ? t('formRecallPrompt') : t('prompt');
  const cell = card.paradigmCell ? paradigmCellLabel(card.paradigmCell) : null;

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md",
        compact && "flex min-h-0 flex-1 flex-col justify-between pt-2 md:pt-0",
      )}
    >
      {!compact ? (
        <p className="text-sm text-muted" aria-live="polite">
          {t('progress', { position: card.position, total: card.total })}
        </p>
      ) : null}

      <div className={cn("relative", compact && "flex min-h-0 flex-1 flex-col")}>
        <IconButton
          type="button"
          size="sm"
          pending={reportPending}
          pendingPolicy="none"
          onClick={onReport}
          aria-label={t('report')}
          className="absolute top-3 right-3 z-10 text-muted hover:text-ink"
        >
          <Flag className="size-4" aria-hidden />
        </IconButton>

        <PressableCard
          onClick={onFlip}
          interactive={flipEnabled}
          aria-expanded={revealBack}
          aria-label={flipEnabled ? t('flipHint') : undefined}
          className={cn(
            compact ? "flex min-h-0 flex-1 flex-col justify-center p-5 md:mt-6 md:flex-none md:p-8" : "mt-6 p-8",
          )}
        >
          {languageName && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {t('languageLabel', { name: languageName })}
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
              {cell.person
                ? t("cellLabelWithPerson", { person: cell.person, form: cell.form })
                : t("cellLabelFormOnly", { form: cell.form })}
            </p>
          )}

          {isFormRecall && (
            <p className={cn("text-muted", compact ? "mt-1 text-xs md:mt-2 md:text-sm" : "mt-2 text-sm")}>
              {languageName
                ? t("formRecallInstruction", { language: languageName })
                : t("formRecallInstructionFallback")}
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
              {t('flipHint')}
            </p>
          )}
        </PressableCard>
      </div>

      {gradesEnabled && (
        <div className={cn(compact && "mt-3 shrink-0 md:mt-6")}>
          <p className={cn("text-sm text-muted", !compact && "mt-6")}>{gradePrompt}</p>

          <div className={cn("grid w-full grid-cols-4 gap-2", compact ? "mt-2 md:mt-4" : "mt-4")}>
            {GRADES.map((grade) => (
              <GradeButton key={grade} grade={grade} onClick={() => onGrade(grade)}>
                {t(grade)}
              </GradeButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
