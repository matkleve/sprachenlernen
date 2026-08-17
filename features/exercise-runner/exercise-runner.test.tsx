import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ExerciseRunner } from "@/features/exercise-runner/ExerciseRunner";
import { FIXTURE_EXERCISE_RECIPE } from "@/lib/exercise-runner/fixture-recipe";

describe("ExerciseRunner", () => {
  it("renders step 1 and progress for fixture recipe", () => {
    render(
      <ExerciseRunner
        methodName="Partial dictation"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    expect(screen.getByRole("heading", { name: "Partial dictation" })).toBeDefined();
    expect(screen.getByText("Get ready")).toBeDefined();
    expect(screen.getByText(/Step 1 of 6/)).toBeDefined();
  });

  it("navigates forward without marking prior step done", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseRunner
        methodName="Partial dictation"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Hear sentence 1 and write it down.")).toBeDefined();
    expect(screen.getByText(/Step 2 of 6/)).toBeDefined();
  });

  it("completes decide via decline", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseRunner
        methodName="Partial dictation"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    const next = screen.getByRole("button", { name: "Next step" });
    for (let i = 0; i < 5; i += 1) {
      await user.click(next);
    }

    await user.click(screen.getByRole("button", { name: "Not now — done" }));
    expect(screen.getByText("Exercise complete")).toBeDefined();
  });
});
