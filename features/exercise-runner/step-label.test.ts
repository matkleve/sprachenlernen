import { describe, expect, it } from "vitest";

import { resolveExerciseStepLabel } from "@/features/exercise-runner/step-label";

describe("resolveExerciseStepLabel", () => {
  const t = (key: string) => key;

  it("prefers labelKey over type default", () => {
    const label = resolveExerciseStepLabel(
      {
        id: "p",
        type: "prepare",
        labelKey: "stepLabelHowItWorks",
        config: {},
      },
      t,
    );
    expect(label).toBe("stepLabelHowItWorks");
  });

  it("falls back to type default", () => {
    const label = resolveExerciseStepLabel({ id: "p", type: "prepare", config: {} }, t);
    expect(label).toBe("stepLabelPrepare");
  });
});
