import type { ExerciseStep, StepAnswer, StepCheckState } from "@/lib/exercise-runner/types";

export type StepRenderProps = {
  step: ExerciseStep;
  /** This step's own answer — never another step's, never the session's. */
  answer: StepAnswer;
  markedErrorTokens: readonly string[];
  listeningDeferred?: boolean;
  onTextChange: (text: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onCheckChange: (check: StepCheckState) => void;
  onToggleError: (token: string) => void;
  onDecline: () => void;
  onSelectOffer: () => void;
};
