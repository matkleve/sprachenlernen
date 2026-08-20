/**
 * Contract: docs/specs/service/form-practice.md (build route §)
 */
import { useState } from "react";

import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormBuildAnswer } from "@/features/review-session/FormBuildAnswer";

function ControlledFixture({
  onSubmit,
  endingChips,
}: {
  onSubmit: () => void;
  endingChips: string[];
}) {
  const [value, setValue] = useState("");
  return (
    <FormBuildAnswer
      value={value}
      onChange={setValue}
      endingChips={endingChips}
      onSubmit={onSubmit}
      label="Stem + ending"
      checkLabel="Check answer"
      accentStripLabel="Accents"
      endingChipsLabel="Endings"
    />
  );
}

describe("FormBuildAnswer", () => {
  it("appends ending chips to the stem field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ControlledFixture onSubmit={onSubmit} endingChips={["o", "a", "amos"]} />);

    const input = screen.getByRole("textbox", { name: "Stem + ending" });
    await user.type(input, "habl");
    await user.click(screen.getByRole("button", { name: "a" }));
    expect((input as HTMLInputElement).value).toBe("habla");

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
