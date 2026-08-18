import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExerciseStepBody } from "@/features/exercise-runner/ExerciseStepBody";

describe("ExerciseStepBody registry", () => {
  it("shows not-built copy for unknown components", () => {
    render(
      <ExerciseStepBody
        step={{
          id: "do-1",
          type: "do",
          component: "audio-play",
          config: {},
        }}
        submitDraft={{ text: "", photoDataUrl: null }}
        markedErrorTokens={[]}
        onTextChange={() => {}}
        onPhotoChange={() => {}}
        onToggleError={() => {}}
        onDecline={() => {}}
        onSelectOffer={() => {}}
      />,
    );

    expect(screen.getByText(/not built yet/i)).toBeDefined();
  });
});
