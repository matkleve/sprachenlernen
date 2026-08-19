"use client";

import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";
import { renderExerciseStep } from "@/features/exercise-runner/step-registry";
import type { ExerciseRunnerState } from "@/lib/exercise-runner";
import { cn } from "@/lib/utils";

type ExerciseStepBodyProps = {
  step: ExerciseRunnerState["recipe"]["steps"][number];
  submitDraft: ExerciseRunnerState["submitDraft"];
  markedErrorTokens: string[];
  listeningDeferred?: boolean;
  bodyScrolls?: boolean;
  onTextChange: (text: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onToggleError: (token: string) => void;
  onDecline: () => void;
  onSelectOffer: () => void;
};

export function ExerciseStepBody(props: ExerciseStepBodyProps) {
  const { bodyScrolls = false } = props;

  return (
    <PracticeSurface
      className={cn(
        "min-h-0 flex-1",
        !bodyScrolls && "overflow-hidden",
      )}
    >
      {renderExerciseStep(props)}
    </PracticeSurface>
  );
}
