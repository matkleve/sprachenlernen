/**
 * Framework-free step-component registry, derived from the descriptors.
 * Contract: docs/specs/service/exercise-step-components.md
 */
import type { ExerciseStep, StepAnswer, StepType } from "@/lib/exercise-runner/types";

import {
  STEP_COMPONENT_DESCRIPTORS,
  type ShippedStepComponentId,
  type StepComponentDescriptor,
} from "./descriptors";
import type { ConfigParse } from "./config";

export const SHIPPED_STEP_COMPONENT_IDS = Object.keys(
  STEP_COMPONENT_DESCRIPTORS,
) as ShippedStepComponentId[];

const SHIPPED = new Set<string>(SHIPPED_STEP_COMPONENT_IDS);

export const STEP_COMPONENT_DEFAULTS: Partial<Record<StepType, ShippedStepComponentId>> = {
  prepare: "checklist",
  do: "prompt",
  submit: "capture",
  review: "self-mark",
  decide: "offers",
};

export function isShippedStepComponent(
  componentId: string | undefined,
): componentId is ShippedStepComponentId {
  return componentId !== undefined && SHIPPED.has(componentId);
}

export function resolveStepComponentId(step: Pick<ExerciseStep, "type" | "component">): string {
  if (step.component) return step.component;
  return STEP_COMPONENT_DEFAULTS[step.type] ?? step.type;
}

export function isStepComponentRenderable(step: Pick<ExerciseStep, "type" | "component">): boolean {
  const id = resolveStepComponentId(step);
  if (step.type === "wait") return true;
  return isShippedStepComponent(id);
}

export function stepComponentDescriptor(
  step: Pick<ExerciseStep, "type" | "component">,
): StepComponentDescriptor | undefined {
  const id = resolveStepComponentId(step);
  return isShippedStepComponent(id) ? STEP_COMPONENT_DESCRIPTORS[id] : undefined;
}

export function allowedStepTypesForComponent(componentId: string): StepType[] | null {
  if (!isShippedStepComponent(componentId)) return null;
  return [...STEP_COMPONENT_DESCRIPTORS[componentId].stepTypes];
}

/** Parsed config for a step, or the keys its recipe failed to supply. */
export function parseStepConfig(step: ExerciseStep): ConfigParse<unknown> {
  const descriptor = stepComponentDescriptor(step);
  if (!descriptor) return { ok: true, config: step.config };
  return descriptor.parseConfig(step.config);
}

/**
 * Whether this step's primary button is live. `wait` and unknown components
 * always complete — the runner must not gate on a rule nobody declared.
 */
export function canCompleteStepAnswer(step: ExerciseStep, answer: StepAnswer): boolean {
  const descriptor = stepComponentDescriptor(step);
  if (!descriptor) return true;
  return descriptor.canComplete(step.config, answer);
}

/** A component-specific primary label, or `undefined` to use the step type's. */
export function primaryLabelKeyForAnswer(
  step: ExerciseStep,
  answer: StepAnswer,
): string | undefined {
  const descriptor = stepComponentDescriptor(step);
  return descriptor?.primaryLabelKey(step.config, answer);
}
