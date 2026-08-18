import type { ExerciseStep, SubmitDraft } from "@/lib/exercise-runner/types";

export type StepRenderProps = {
  step: ExerciseStep;
  submitDraft: SubmitDraft;
  markedErrorTokens: string[];
  listeningDeferred?: boolean;
  onTextChange: (text: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onToggleError: (token: string) => void;
  onDecline: () => void;
  onSelectOffer: () => void;
};
