import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("toggles when the inline label is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Keep in library" onChange={onChange} />);

    await user.click(screen.getByText("Keep in library"));
    expect(onChange).toHaveBeenCalled();
  });

  it("shows accent fill when checked", () => {
    render(<Checkbox checked readOnly aria-label="Ready" />);
    const marker = screen.getByRole("checkbox").nextElementSibling;
    expect(marker?.className).toContain("bg-accent-deep");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Save" disabled onChange={onChange} />);

    await user.click(screen.getByText("Save"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no accessibility violations with label", async () => {
    const { container } = render(<Checkbox label="Keyboard ready" />);
    await expectNoA11yViolations(container);
  });
});
