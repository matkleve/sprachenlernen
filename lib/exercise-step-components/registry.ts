/**
 * Framework-free step-component registry. Contract:
 * docs/specs/service/exercise-step-components.md
 */
import type { ExerciseStep, StepType } from "@/lib/exercise-runner/types";

import {
  SHIPPED_STEP_COMPONENT_IDS,
  STEP_COMPONENT_DEFAULTS,
  type ShippedStepComponentId,
} from "./types";

const SHIPPED = new Set<string>(SHIPPED_STEP_COMPONENT_IDS);

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

export function allowedStepTypesForComponent(componentId: string): StepType[] | null {
  const map: Record<ShippedStepComponentId, StepType[]> = {
    checklist: ["prepare"],
    "material-preview": ["prepare"],
    "sheet-download": ["prepare"],
    prompt: ["do"],
    "text-display": ["do"],
    "speak-prompt": ["do"],
    "type-with-word": ["do"],
    "gap-fill": ["do"],
    "full-dictation": ["do"],
    capture: ["submit"],
    "self-mark": ["review"],
    feedback: ["review"],
    "comprehension-questions": ["review"],
    "reveal-answer": ["review"],
    offers: ["decide"],
    summary: ["decide"],
  };
  if (!isShippedStepComponent(componentId)) return null;
  return map[componentId];
}
