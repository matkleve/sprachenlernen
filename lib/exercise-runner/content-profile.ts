/** Contract: docs/specs/feature/exercise-runner.layout.md */

import { resolveStepComponentId } from "@/lib/exercise-step-components";

import type { ExerciseStep } from "./types";

export type ExerciseContentProfile = "short" | "scroll" | "paginated";

/** Short-profile content budget — reviews/design/DR-043-exercise-mobile-fit-frame.md */
export const SHORT_STEP_BUDGET = {
  maxPrepRows: 2,
  maxIntroChars: 140,
} as const;

/** Step components that may scroll inside the body zone (reading / long passages). */
const SCROLL_COMPONENT_IDS = new Set(["text-display", "parallel-text", "material-preview"]);

/**
 * Layout profile for the runner body zone. Default `short` — no inner scroll.
 * Recipe authors keep short steps within the fit frame; only reading steps scroll.
 */
export function exerciseStepContentProfile(step: ExerciseStep): ExerciseContentProfile {
  if (step.type === "wait") return "short";

  const componentId = resolveStepComponentId(step);
  if (componentId === "text-display") {
    return "paginated"; // v2 turns; v1 scroll inside body
  }
  if (SCROLL_COMPONENT_IDS.has(componentId)) return "scroll";
  return "short";
}

export function bodyZoneScrolls(profile: ExerciseContentProfile): boolean {
  return profile === "scroll" || profile === "paginated";
}
