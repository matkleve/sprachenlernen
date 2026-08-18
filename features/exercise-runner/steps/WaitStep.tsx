"use client";

import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function WaitStep({ step }: Pick<StepRenderProps, "step">) {
  return (
    <p className="text-base text-muted">
      {typeof step.config.durationSec === "number" ? `${step.config.durationSec}s` : ""}
    </p>
  );
}
