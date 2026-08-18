/** Contract: docs/specs/service/exercise-step-components.md */
import type { StepType } from "@/lib/exercise-runner/types";

/** Runner widgets shipped today — unknown ids render not-built copy. */
export const SHIPPED_STEP_COMPONENT_IDS = [
  "checklist",
  "material-preview",
  "prompt",
  "text-display",
  "speak-prompt",
  "gap-fill",
  "full-dictation",
  "sheet-download",
  "capture",
  "self-mark",
  "feedback",
  "comprehension-questions",
  "audio-play",
  "type-with-word",
  "cloze-type",
  "minimal-pair",
  "timed-write",
  "reveal-answer",
  "round-marker",
  "type-freely",
  "voice-submit",
  "diff-highlight",
  "rubric",
  "confirm-done",
  "debrief-prompt",
  "offers",
  "summary",
] as const;

export type ShippedStepComponentId = (typeof SHIPPED_STEP_COMPONENT_IDS)[number];

export type StepComponentMeta = {
  id: string;
  stepTypes: readonly StepType[];
  shipped: boolean;
};

export const STEP_COMPONENT_DEFAULTS: Partial<Record<StepType, string>> = {
  prepare: "checklist",
  do: "prompt",
  submit: "capture",
  review: "self-mark",
  decide: "offers",
};
