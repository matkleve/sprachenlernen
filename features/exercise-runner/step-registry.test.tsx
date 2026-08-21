import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExerciseStepBody } from "@/features/exercise-runner/ExerciseStepBody";
import { NO_SESSION_FINDINGS } from "@/lib/exercise-runner";
import { EMPTY_STEP_ANSWER } from "@/lib/exercise-runner/types";
import { SHIPPED_STEP_COMPONENT_IDS } from "@/lib/exercise-step-components";

describe("ExerciseStepBody registry", () => {
  it("AC-2: shows not-built copy for unknown components", () => {
    render(
      <ExerciseStepBody
        step={{
          id: "do-1",
          type: "do",
          component: "audio-play",
          config: {},
        }}
        answer={EMPTY_STEP_ANSWER}
        sessionFindings={NO_SESSION_FINDINGS}
        onTextChange={() => {}}
        onPhotoChange={() => {}}
        onCheckChange={() => {}}
        onToggleError={() => {}}
        onDecline={() => {}}
        onSelectOffer={() => {}}
      />,
    );

    expect(
      screen.getByText(en.exerciseRunner.unknownComponent.replace("{component}", "audio-play")),
    ).toBeDefined();
  });

  it("AC-1: renders checklist for a shipped prepare step", () => {
    render(
      <ExerciseStepBody
        step={{
          id: "prepare-1",
          type: "prepare",
          component: "checklist",
          label: "Get ready",
          config: { items: ["Pen and paper"] },
        }}
        answer={EMPTY_STEP_ANSWER}
        sessionFindings={NO_SESSION_FINDINGS}
        onTextChange={() => {}}
        onPhotoChange={() => {}}
        onCheckChange={() => {}}
        onToggleError={() => {}}
        onDecline={() => {}}
        onSelectOffer={() => {}}
      />,
    );

    expect(screen.getByText("Pen and paper")).toBeDefined();
    expect(screen.queryByText(/not built yet/i)).toBeNull();
  });

  it("renders speak-prompt for a shipped do step", () => {
    render(
      <ExerciseStepBody
        step={{
          id: "speak-1",
          type: "do",
          component: "speak-prompt",
          label: "Read aloud",
          config: { body: "Say it out loud.", text: "Hola mundo." },
        }}
        answer={EMPTY_STEP_ANSWER}
        sessionFindings={NO_SESSION_FINDINGS}
        onTextChange={() => {}}
        onPhotoChange={() => {}}
        onCheckChange={() => {}}
        onToggleError={() => {}}
        onDecline={() => {}}
        onSelectOffer={() => {}}
      />,
    );

    expect(screen.getByText("Say it out loud.")).toBeDefined();
    expect(screen.getByText("Hola mundo.")).toBeDefined();
  });
});

describe("registry consistency", () => {
  /**
   * The failure this guards against is silent: a component declared in the
   * descriptors but missing a renderer used to fall through to *not built yet*
   * copy in front of the learner. The renderer map is typed as a total record
   * so that is now a compile error; this asserts the other direction at runtime
   * and keeps the guarantee visible to anyone reading the tests.
   */
  it("renders something other than not-built for every shipped component", () => {
    for (const componentId of SHIPPED_STEP_COMPONENT_IDS) {
      const { unmount } = render(
        <ExerciseStepBody
          step={{ id: `step-${componentId}`, type: "do", component: componentId, config: {} }}
          answer={EMPTY_STEP_ANSWER}
          sessionFindings={NO_SESSION_FINDINGS}
          onTextChange={() => {}}
          onPhotoChange={() => {}}
          onCheckChange={() => {}}
          onToggleError={() => {}}
          onDecline={() => {}}
          onSelectOffer={() => {}}
        />,
      );

      expect(screen.queryByText(/not built yet/i), componentId).toBeNull();
      unmount();
    }
  });
});
