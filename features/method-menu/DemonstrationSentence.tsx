"use client";

import { useState } from "react";

import { GradeButton } from "@/components/ui/GradeButton";
import { PressableCard } from "@/components/ui/PressableCard";
import type { DemonstrationSentencePick } from "@/lib/demonstration-sentence";
import type { Grade } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

import { copy } from "./content";

const DEMONSTRATION_GRADES = ["hard", "good", "easy"] as const satisfies readonly Grade[];

const GRADE_LABELS: Record<typeof DEMONSTRATION_GRADES[number], string> = {
  hard: copy.demonstrationGradeHard,
  good: copy.demonstrationGradeGood,
  easy: copy.demonstrationGradeEasy,
};

export type DemonstrationSentenceProps = {
  pick: DemonstrationSentencePick;
};

/**
 * One checkable sentence on the method menu. Contract:
 * docs/specs/feature/demonstration-sentence.md
 */
export function DemonstrationSentence({ pick }: DemonstrationSentenceProps) {
  const [flipped, setFlipped] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const graded = feedback !== null;

  function flip() {
    if (graded || flipped) return;
    setFlipped(true);
  }

  function onGrade(selected: Grade) {
    if (graded || !flipped) return;
    const message =
      selected === "hard"
        ? copy.demonstrationFeedbackHard
        : selected === "good"
          ? copy.demonstrationFeedbackGood
          : copy.demonstrationFeedbackEasy;
    setFeedback(message);
  }

  return (
    <section className="mt-6 max-w-md" aria-label={copy.demonstrationLabel}>
      <p className="text-sm font-medium text-ink">{copy.demonstrationLabel}</p>

      <PressableCard
        onClick={flip}
        interactive={!graded && !flipped}
        aria-expanded={flipped}
        aria-label={!graded && !flipped ? copy.demonstrationFlipHint : undefined}
        className="mt-3 p-6"
      >
        <p
          className={cn(
            "text-xl font-semibold text-ink transition-transform duration-300",
            flipped && "scale-95 opacity-80",
          )}
        >
          {pick.text}
        </p>

        {flipped ? (
          <p className="mt-4 border-t border-line pt-4 text-base text-muted">{pick.translation}</p>
        ) : null}

        {!graded && !flipped ? (
          <p className="pointer-events-none absolute right-4 bottom-3 flex items-center gap-1 text-xs text-muted">
            <span aria-hidden className="text-sm leading-none">↻</span>
            {copy.demonstrationFlipHint}
          </p>
        ) : null}
      </PressableCard>

      {flipped && !graded ? (
        <div className="mt-4">
          <p className="text-sm text-muted">{copy.demonstrationGradePrompt}</p>
          <div className="mt-3 grid w-full grid-cols-3 gap-2">
            {DEMONSTRATION_GRADES.map((grade) => (
              <GradeButton key={grade} grade={grade} onClick={() => onGrade(grade)}>
                {GRADE_LABELS[grade]}
              </GradeButton>
            ))}
          </div>
        </div>
      ) : null}

      {feedback ? (
        <p className="mt-4 text-base leading-relaxed text-muted">{feedback}</p>
      ) : null}
    </section>
  );
}
