import { Button } from "@/components/ui/Button";
import { copy } from "@/features/review-session/content";
import { canGrade, showsBack } from "@/features/review-session/session-machine";
import type { SessionCard } from "@/lib/session-builder";
import { GRADES, type Grade } from "@/lib/scheduler";

type ReviewCardProps = {
  card: SessionCard;
  phase: Parameters<typeof canGrade>[0];
  persistError: string | null;
  onGrade: (grade: Grade) => void;
};

export function ReviewCard({ card, phase, persistError, onGrade }: ReviewCardProps) {
  const gradesEnabled = canGrade(phase);
  const isSaving = phase === "persisting";
  const revealBack = showsBack(phase);

  return (
    <>
      <p className="text-sm text-muted" aria-live="polite">
        {copy.progress(card.position, card.total)}
      </p>

      <div className="mt-6 rounded-card border border-line bg-surface p-8 text-center shadow-soft">
        <p className="text-2xl font-semibold text-ink">{card.front}</p>
        {revealBack && <p className="mt-4 text-base text-muted">{card.back}</p>}
      </div>

      <p className="mt-6 text-sm text-muted">{copy.prompt}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {GRADES.map((grade) => (
          <Button
            key={grade}
            type="button"
            variant={grade === "again" ? "danger" : "secondary"}
            disabled={!gradesEnabled || isSaving}
            onClick={() => onGrade(grade)}
          >
            {copy[grade]}
          </Button>
        ))}
      </div>

      {isSaving && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {copy.saving}
        </p>
      )}
      {revealBack && !persistError && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {copy.graded}
        </p>
      )}
      {persistError && (
        <p className="mt-6 text-sm text-danger" aria-live="polite">
          {copy.saveError}
        </p>
      )}
    </>
  );
}
