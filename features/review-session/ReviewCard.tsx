import { Button } from "@/components/ui/Button";
import { copy } from "@/features/review-session/content";
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
  /** Hides progress line and tightens spacing for mobile one-screen layout. */
  compact?: boolean;
};

const gradeVariant = (grade: Grade): "ghost" | "secondary" => {
  if (grade === "again") return "ghost";
  return "secondary";
};

export function ReviewCard({
  card,
  languageName,
  phase,
  onFlip,
  onGrade,
  compact = false,
}: ReviewCardProps) {
  const flipEnabled = canFlip(phase);
  const gradesEnabled = canGrade(phase);
  const revealBack = showsBack(phase);
  const isFormRecall = isFormRecallTaskId(card.taskId);
  const gradePrompt = isFormRecall ? copy.formRecallPrompt : copy.prompt;
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
          {copy.progress(card.position, card.total)}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onFlip}
        disabled={!flipEnabled}
        aria-expanded={revealBack}
        aria-label={flipEnabled ? copy.flipHint : undefined}
        className={cn(
          "group relative w-full rounded-card border border-line bg-surface text-center shadow-soft",
          compact ? "flex min-h-0 flex-1 flex-col justify-center p-5 md:mt-6 md:flex-none md:p-8" : "mt-6 p-8",
          "transition-[box-shadow,transform] duration-200 ease-out-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          flipEnabled && "cursor-pointer hover:-translate-y-px hover:shadow-raised active:scale-[0.98] active:translate-y-0",
          !flipEnabled && "cursor-default",
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
      </button>

      {gradesEnabled && (
        <div className={cn(compact && "mt-3 shrink-0 md:mt-6")}>
          <p className={cn("text-sm text-muted", !compact && "mt-6")}>{gradePrompt}</p>

          <div className={cn("grid w-full grid-cols-4 gap-2", compact ? "mt-2 md:mt-4" : "mt-4")}>
            {GRADES.map((grade) => (
              <Button
                key={grade}
                type="button"
                variant={gradeVariant(grade)}
                size="sm"
                className={cn("w-full", grade === "again" && "text-muted")}
                onClick={() => onGrade(grade)}
              >
                {copy[grade]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
