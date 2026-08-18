/** Contract: docs/specs/service/exercise-step-components.md */
import type { StepType } from "@/lib/exercise-runner/types";

/** Runner widgets shipped today — unknown ids render not-built copy. */
export const SHIPPED_STEP_COMPONENT_IDS = [
  "checklist",
  "prompt",
  "gap-fill",
  "capture",
  "self-mark",
  "feedback",
  "offers",
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
