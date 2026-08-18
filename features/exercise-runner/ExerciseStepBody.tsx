"use client";

import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";
import { renderExerciseStep } from "@/features/exercise-runner/step-registry";
import type { ExerciseRunnerState } from "@/lib/exercise-runner";

type ExerciseStepBodyProps = {
  step: ExerciseRunnerState["recipe"]["steps"][number];
  submitDraft: ExerciseRunnerState["submitDraft"];
  markedErrorTokens: string[];
  listeningDeferred?: boolean;
  onTextChange: (text: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onToggleError: (token: string) => void;
  onDecline: () => void;
  onSelectOffer: () => void;
};

export function ExerciseStepBody(props: ExerciseStepBodyProps) {
  return <PracticeSurface>{renderExerciseStep(props)}</PracticeSurface>;
}
