/**
 * Expand recipe templates at compose time — loops stay out of runner state.
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import type { ExerciseStep } from "@/lib/exercise-runner/types";

export type StepTemplate = Omit<ExerciseStep, "id"> & { id?: string };

export function withStepIds(prefix: string, templates: StepTemplate[]): ExerciseStep[] {
  return templates.map((template, index) => ({
    ...template,
    id: template.id ?? `${prefix}-${index + 1}`,
  }));
}

/** Repeat the same step block N times — e.g. one dictation sentence per iteration. */
export function expandItemLoop(
  count: number,
  prefix: string,
  templates: StepTemplate[],
): ExerciseStep[] {
  const steps: ExerciseStep[] = [];
  for (let i = 0; i < count; i += 1) {
    const suffix = count > 1 ? ` (${i + 1}/${count})` : "";
    steps.push(
      ...withStepIds(
        `${prefix}-${i + 1}`,
        templates.map((template) => ({
          ...template,
          label:
            typeof template.label === "string" ? `${template.label}${suffix}` : template.label,
        })),
      ),
    );
  }
  return steps;
}
