"use client";

import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GradeButton } from "@/components/ui/GradeButton";
import { IconButton } from "@/components/ui/IconButton";
import { PressableCard } from "@/components/ui/PressableCard";
import { textLinkVariants } from "@/components/ui/TextLink";
import { CardReportPopover } from "@/features/review-session/CardReportPopover";
import { FormAnswerInput } from "@/features/review-session/FormAnswerInput";
import { FormAnswerRoutes } from "@/features/review-session/FormAnswerRoutes";
import { FormBuildAnswer } from "@/features/review-session/FormBuildAnswer";
import { FormSpokenAnswer } from "@/features/review-session/FormSpokenAnswer";
import {
  gradesForFormAnswerRoute,
  type FormAnswerRoute,
} from "@/lib/form-answer-routes";
import { FormErrorExplanation } from "@/features/review-session/FormErrorExplanation";
import {
  canFlip,
  canGrade,
  showsBack,
} from "@/features/review-session/session-machine";
import type { ReportCardInput } from "@/lib/card-report";
import { gradeTypedFormAnswer } from "@/lib/form-answer-grade";
import type { GradeFormAnswerResult } from "@/lib/form-inverse-index";
import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import { paradigmCellLabel } from "@/lib/paradigm-cells";
import type { SessionCard } from "@/lib/session-builder";
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
  exiting?: boolean;
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
  exiting = false,
  compact = false,
}: ReviewCardProps) {
  const t = useTranslations("reviewSession");
  const flagRef = useRef<HTMLButtonElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [explainExpanded, setExplainExpanded] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerRoute, setAnswerRoute] = useState<FormAnswerRoute>("typed");
  const [answerResult, setAnswerResult] = useState<GradeFormAnswerResult | null>(null);

  const flipEnabled = canFlip(phase) && !exiting;
  const revealBack = showsBack(phase);
  const isFormRecall = isFormRecallTaskId(card.taskId);
  const interactiveFormRecall =
    isFormRecall && Boolean(card.acceptedForms?.length && card.lemmaSurfaces?.length);
  const buildRouteAvailable =
    interactiveFormRecall && Boolean(card.endingChips?.length);
  const gradesEnabled =
    canGrade(phase) && !exiting && (!interactiveFormRecall || revealBack);
  const gradePrompt = isFormRecall ? t("formRecallPrompt") : t("prompt");
  const gradesForCard = interactiveFormRecall
    ? gradesForFormAnswerRoute(answerRoute)
    : GRADES;
  const cell = card.paradigmCell ? paradigmCellLabel(card.paradigmCell) : null;

  useEffect(() => {
    setTypedAnswer("");
    setAnswerRoute("typed");
    setAnswerResult(null);
    setExplainExpanded(false);
  }, [card.taskId]);

  const handleSubmitReport = async (input: ReportCardInput) => {
    await onSubmitReport(input);
    setReportOpen(false);
  };

  const handleGrade = (value: Grade) => {
    if (isFormRecall && card.formExplanation && (value === "again" || value === "hard")) {
      setExplainExpanded(true);
    }
    onGrade(value);
  };

  const handleCheckAnswer = () => {
    if (!interactiveFormRecall || !card.acceptedForms || !card.lemmaSurfaces) return;
    const result = gradeTypedFormAnswer({
      answer: typedAnswer,
      acceptedForms: card.acceptedForms,
      lemmaSurfaces: new Set(card.lemmaSurfaces),
    });
    setAnswerResult(result);
    onFlip();
  };

  const cardFlipEnabled = flipEnabled && !interactiveFormRecall;
  const cardShellClass = cn(
    "relative w-full rounded-card border border-line bg-surface text-center shadow-soft",
    compact ? "flex min-h-0 flex-1 flex-col justify-center p-5 md:mt-6 md:flex-none md:p-8" : "mt-6 p-8",
    "transition-[opacity,transform] duration-300",
    exiting && "pointer-events-none scale-[0.98] -translate-y-2 opacity-0",
  );

  const cardBody = (
    <>
          {languageName && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {t("languageLabel", { name: languageName })}
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

          {isFormRecall && !interactiveFormRecall && (
            <p className={cn("text-muted", compact ? "mt-1 text-xs md:mt-2 md:text-sm" : "mt-2 text-sm")}>
              {languageName
                ? t("formRecallInstruction", { language: languageName })
                : t("formRecallInstructionFallback")}
            </p>
          )}

          {interactiveFormRecall && flipEnabled ? (
            <>
              <FormAnswerRoutes
                value={answerRoute}
                onChange={(route) => {
                  setAnswerRoute(route);
                  setTypedAnswer("");
                  setAnswerResult(null);
                }}
                typedLabel={t("formAnswerRouteTyped")}
                buildLabel={t("formAnswerRouteBuild")}
                spokenLabel={t("formAnswerRouteSpoken")}
                buildAvailable={buildRouteAvailable}
                routesLabel={t("formAnswerRoutesLabel")}
              />

              {answerRoute === "spoken" ? (
                <FormSpokenAnswer
                  instruction={
                    languageName
                      ? t("formSpokenInstruction", { language: languageName })
                      : t("formSpokenInstructionFallback")
                  }
                  showAnswerLabel={t("formSpokenShowAnswer")}
                  onShowAnswer={onFlip}
                />
              ) : answerRoute === "build" && buildRouteAvailable && card.endingChips ? (
                <FormBuildAnswer
                  value={typedAnswer}
                  onChange={setTypedAnswer}
                  endingChips={card.endingChips}
                  onSubmit={handleCheckAnswer}
                  label={
                    languageName
                      ? t("formBuildLabel", { language: languageName })
                      : t("formBuildLabelFallback")
                  }
                  checkLabel={t("formAnswerCheck")}
                  accentStripLabel={t("formAccentStrip")}
                  endingChipsLabel={t("formEndingChips")}
                  autoFocus
                />
              ) : (
                <FormAnswerInput
                  value={typedAnswer}
                  onChange={setTypedAnswer}
                  onSubmit={handleCheckAnswer}
                  label={
                    languageName
                      ? t("formAnswerLabel", { language: languageName })
                      : t("formAnswerLabelFallback")
                  }
                  checkLabel={t("formAnswerCheck")}
                  accentStripLabel={t("formAccentStrip")}
                  autoFocus
                />
              )}
            </>
          ) : null}

          {interactiveFormRecall && flipEnabled && answerRoute !== "spoken" ? (
            <button
              type="button"
              className={textLinkVariants({ tone: "muted", size: "sm", className: "mt-3" })}
              onClick={onFlip}
            >
              {t("formAnswerReveal")}
            </button>
          ) : null}

          {revealBack && answerResult ? (
            <p
              className={cn(
                "font-medium",
                compact ? "mt-3 text-sm md:text-base" : "mt-4 text-base",
                answerResult.correct ? "text-success" : "text-danger",
              )}
              role="status"
            >
              {answerResult.correct
                ? answerResult.accentForgiven
                  ? t("formAnswerCorrectAccent")
                  : t("formAnswerCorrect")
                : t("formAnswerIncorrect", { answer: card.back ?? "" })}
            </p>
          ) : null}

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

          {revealBack && isFormRecall && card.formExplanation ? (
            <FormErrorExplanation
              explanation={card.formExplanation}
              defaultExpanded={explainExpanded}
            />
          ) : null}

          {cardFlipEnabled && (
            <p className="pointer-events-none absolute right-4 bottom-3 flex items-center gap-1 text-xs text-muted">
              <span aria-hidden className="text-sm leading-none">
                ↻
              </span>
              {t("flipHint")}
            </p>
          )}
    </>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md",
        compact && "flex min-h-0 flex-1 flex-col justify-between pt-2 md:pt-0",
      )}
    >
      {!compact ? (
        <p className="text-sm text-muted" aria-live="polite">
          {t("progress", { position: card.position, total: card.total })}
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
          aria-label={t("report")}
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

        {interactiveFormRecall ? (
          <div className={cardShellClass}>{cardBody}</div>
        ) : (
          <PressableCard
            onClick={cardFlipEnabled ? onFlip : undefined}
            interactive={cardFlipEnabled}
            aria-expanded={revealBack}
            aria-label={cardFlipEnabled ? t("flipHint") : undefined}
            className={cardShellClass}
          >
            {cardBody}
          </PressableCard>
        )}
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
              "grid w-full",
              gradesForCard.length === 3 ? "grid-cols-3" : "grid-cols-4",
              compact ? "mt-1.5 gap-1.5 md:mt-4 md:gap-2" : "mt-4 gap-2",
            )}
          >
            {gradesForCard.map((grade) => (
              <GradeButton
                key={grade}
                grade={grade}
                onClick={() => handleGrade(grade)}
              >
                {t(grade)}
              </GradeButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
