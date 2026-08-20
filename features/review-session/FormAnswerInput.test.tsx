/**
 * Contract: docs/specs/service/form-practice.md (typed route §)
 */
import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { useState } from "react";

import { FormAnswerInput } from "@/features/review-session/FormAnswerInput";

function ControlledFixture({ onSubmit }: { onSubmit: () => void }) {
  const [value, setValue] = useState("");
  return (
    <FormAnswerInput
      value={value}
      onChange={setValue}
      onSubmit={onSubmit}
      label="Spanish form"
      checkLabel="Check answer"
      accentStripLabel="Accents"
    />
  );
}

describe("FormAnswerInput", () => {
  it("disables autocorrect and renders the accent strip", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ControlledFixture onSubmit={onSubmit} />);

    const input = screen.getByRole("textbox", { name: "Spanish form" });
    expect(input.getAttribute("autocorrect")).toBe("off");
    expect(input.getAttribute("autocapitalize")).toBe("off");
    expect(screen.getByRole("button", { name: "á" })).toBeDefined();

    await user.type(input, "hablo");
    await user.click(screen.getByRole("button", { name: en.reviewSession.formAnswerCheck }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
