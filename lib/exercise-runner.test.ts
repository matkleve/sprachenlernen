/**
 * Contract: docs/specs/feature/exercise-runner.md
 */
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_EXERCISE_RECIPE } from "@/lib/exercise-runner/fixture-recipe";
import {
  abandonRunner,
  canCompleteStep,
  completeStep,
  createRunnerState,
  declineDecide,
  navigateRelative,
  navigateToStep,
  progressLabel,
  setStepText,
  tickTimer,
} from "@/lib/exercise-runner/runner-state";

describe("exercise-runner state", () => {
  it("marks seen on navigation without marking done", () => {
    let state = createRunnerState(FIXTURE_EXERCISE_RECIPE);
    expect(state.stepStatuses[0]).toBe("seen");
    expect(state.stepStatuses[1]).toBe("unseen");

    state = navigateRelative(state, 1);
    expect(state.activeStepIndex).toBe(1);
    expect(state.stepStatuses[0]).toBe("seen");
    expect(state.stepStatuses[0]).not.toBe("done");
    expect(state.stepStatuses[1]).toBe("seen");

    state = navigateRelative(state, 1);
    expect(state.activeStepIndex).toBe(2);
    expect(state.stepStatuses[1]).not.toBe("done");
    expect(state.stepStatuses[2]).toBe("seen");
  });

  it("reflects recipe length in progress label", () => {
    const state = createRunnerState(FIXTURE_EXERCISE_RECIPE);
    expect(progressLabel(state)).toBe("1 / 6");
  });

  it("keeps wait timer running across step navigation", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    let state = navigateToStep(createRunnerState(FIXTURE_EXERCISE_RECIPE), 2, now);
    expect(state.timer?.stepId).toBe("wait-1");

    vi.setSystemTime(now + 5_000);
    state = tickTimer(state, now + 5_000);
    state = navigateRelative(state, 1, now + 5_000);

    expect(state.timer?.stepId).toBe("wait-1");
    expect(state.timer?.elapsedMs).toBeGreaterThanOrEqual(5_000);

    vi.useRealTimers();
  });

  it("does not auto-done when timer expires", () => {
    const now = Date.now();
    let state = navigateToStep(createRunnerState(FIXTURE_EXERCISE_RECIPE), 2, now);
    state = tickTimer(state, now + 31_000);
    expect(state.timer?.expired).toBe(true);
    expect(state.stepStatuses[2]).not.toBe("done");
  });

  it("requires photo or text before submit done", () => {
    let state = navigateToStep(createRunnerState(FIXTURE_EXERCISE_RECIPE), 3);
    expect(canCompleteStep(state)).toBe(false);

    state = setStepText(state, "submit-1", "mi texto");
    expect(canCompleteStep(state)).toBe(true);

    state = setStepText(state, "submit-1", "");
    expect(canCompleteStep(state)).toBe(false);
  });

  it("ends with no backlog when decide is declined", () => {
    let state = createRunnerState(FIXTURE_EXERCISE_RECIPE);
    state = navigateToStep(state, 5);
    state = declineDecide(state);
    expect(state.phase).toBe("complete");
    expect(state.stepStatuses[5]).toBe("done");
  });

  it("abandons mid-recipe without completing", () => {
    let state = createRunnerState(FIXTURE_EXERCISE_RECIPE);
    state = navigateRelative(state, 1);
    state = abandonRunner(state);
    expect(state.phase).toBe("abandoned");
    expect(state.stepStatuses[1]).not.toBe("done");
  });

  it("marks do step done only via completeStep", () => {
    let state = navigateToStep(createRunnerState(FIXTURE_EXERCISE_RECIPE), 1);
    state = completeStep(state);
    expect(state.stepStatuses[1]).toBe("done");
    expect(state.activeStepIndex).toBe(2);
  });
});
