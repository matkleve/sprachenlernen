import type { SessionFindings } from "@/lib/exercise-runner";
import type { ExerciseStep, StepAnswer, StepCheckState } from "@/lib/exercise-runner/types";

export type StepRenderProps = {
  step: ExerciseStep;
  /** This step's own answer — never another step's, never the session's. */
  answer: StepAnswer;
  /**
   * Read-only across the whole session. Only `decide` components may use it: a
   * closing step is about the session, everything else is about its own answer.
   */
  sessionFindings: SessionFindings;
  listeningDeferred?: boolean;
  onTextChange: (text: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onCheckChange: (check: StepCheckState) => void;
  onToggleError: (token: string) => void;
  onDecline: () => void;
  onSelectOffer: () => void;
};
