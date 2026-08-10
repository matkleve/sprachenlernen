import { Button } from "@/components/ui/Button";
import { copy } from "@/features/review-session/content";
import {
  canFlip,
  canGrade,
  showsBack,
} from "@/features/review-session/session-machine";
import type { SessionCard } from "@/lib/session-builder";
import { GRADES, type Grade } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

type ReviewCardProps = {
  card: SessionCard;
  languageName: string | null;
  phase: Parameters<typeof canGrade>[0];
  onFlip: () => void;
  onGrade: (grade: Grade) => void;
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
}: ReviewCardProps) {
  const flipEnabled = canFlip(phase);
  const gradesEnabled = canGrade(phase);
  const revealBack = showsBack(phase);

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm text-muted" aria-live="polite">
        {copy.progress(card.position, card.total)}
      </p>

      <button
        type="button"
        onClick={onFlip}
        disabled={!flipEnabled}
        aria-expanded={revealBack}
        aria-label={flipEnabled ? copy.flipHint : undefined}
        className={cn(
          "group relative mt-6 w-full rounded-card border border-line bg-surface p-8 text-center shadow-soft",
          "transition-[box-shadow,transform] duration-200 ease-out-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          flipEnabled && "cursor-pointer hover:-translate-y-px hover:shadow-raised active:translate-y-0",
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
            "text-2xl font-semibold text-ink transition-transform duration-300",
            languageName ? "mt-2" : "",
            revealBack && "scale-95 opacity-80",
          )}
        >
          {card.front}
        </p>

        {revealBack && (
          <p className="mt-4 border-t border-line pt-4 text-base text-muted">{card.back}</p>
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
        <>
          <p className="mt-6 text-sm text-muted">{copy.prompt}</p>

          <div className="mt-4 grid w-full grid-cols-4 gap-2">
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
        </>
      )}
    </div>
  );
}
