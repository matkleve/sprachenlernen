/**
 * Contract: docs/specs/service/form-practice.md (spoken route §)
 */
import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormSpokenAnswer } from "@/features/review-session/FormSpokenAnswer";

describe("FormSpokenAnswer", () => {
  it("reveals the model answer for self-comparison", async () => {
    const user = userEvent.setup();
    const onShowAnswer = vi.fn();

    render(
      <FormSpokenAnswer
        instruction="Say the Spanish form aloud."
        showAnswerLabel="Show answer"
        onShowAnswer={onShowAnswer}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show answer" }));
    expect(onShowAnswer).toHaveBeenCalled();
  });
});
