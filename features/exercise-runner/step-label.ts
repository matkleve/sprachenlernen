import type { ExerciseStep } from "@/lib/exercise-runner/types";

type ExerciseRunnerT = (key: string) => string;

const LABEL_KEY_BY_TYPE: Partial<Record<ExerciseStep["type"], string>> = {
  prepare: "stepLabelPrepare",
  do: "stepLabelDo",
  wait: "stepLabelWait",
  submit: "stepLabelSubmit",
  review: "stepLabelReview",
  decide: "stepLabelDecide",
};

/** Prefer `labelKey` on the step, else type default, else raw `label`. */
export function resolveExerciseStepLabel(step: ExerciseStep, t: ExerciseRunnerT): string {
  if (typeof step.labelKey === "string" && step.labelKey) {
    return t(step.labelKey);
  }
  const typeKey = LABEL_KEY_BY_TYPE[step.type];
  if (typeKey) return t(typeKey);
  return step.label ?? "";
}
