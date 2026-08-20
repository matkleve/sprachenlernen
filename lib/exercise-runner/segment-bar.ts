import type { StepStatus } from "@/lib/exercise-runner/types";

/**
 * Footer segment colour — resolved from index + active step + status.
 * Contract: docs/specs/feature/exercise-runner.layout.md § Step segments
 */
export function segmentBarClass(
  index: number,
  activeStepIndex: number,
  status: StepStatus,
): string {
  if (status === "done") {
    return "bg-accent-soft dark:bg-accent/35";
  }
  if (index === activeStepIndex) {
    return "bg-accent";
  }
  switch (status) {
    case "seen":
      return "bg-line-strong/45";
    default:
      return "bg-line";
  }
}
