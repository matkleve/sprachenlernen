import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExerciseStepBody } from "@/features/exercise-runner/ExerciseStepBody";

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
        submitDraft={{ text: "", photoDataUrl: null }}
        markedErrorTokens={[]}
        onTextChange={() => {}}
        onPhotoChange={() => {}}
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
        submitDraft={{ text: "", photoDataUrl: null }}
        markedErrorTokens={[]}
        onTextChange={() => {}}
        onPhotoChange={() => {}}
        onToggleError={() => {}}
        onDecline={() => {}}
        onSelectOffer={() => {}}
      />,
    );

    expect(screen.getByText("Say it out loud.")).toBeDefined();
    expect(screen.getByText("Hola mundo.")).toBeDefined();
  });
});
