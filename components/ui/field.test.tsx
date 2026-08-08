import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Field } from "./Field";
import { Input, Textarea } from "./Input";

/** The named check for docs/specs/component/field.md. */

describe("Field", () => {
  it("focuses the control when the label is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Email">
        <Input type="email" />
      </Field>,
    );

    await user.click(screen.getByText("Email"));

    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });

  it("describes the control with the hint first, then the error", () => {
    // Order is not cosmetic: a screen reader reads describedby in the order
    // given, and the hint is what the user needs before the complaint.
    render(
      <Field label="Email" description="We only use this to reply." error="Not a valid address.">
        <Input type="email" />
      </Field>,
    );

    const ids = screen.getByRole("textbox").getAttribute("aria-describedby")!.split(" ");
    const text = ids.map((id) => document.getElementById(id)?.textContent);

    expect(text).toEqual(["We only use this to reply.", "Not a valid address."]);
  });

  it("omits aria-invalid entirely when there is no error", () => {
    // `aria-invalid="false"` on every field in a form is noise, not information.
    render(
      <Field label="Email">
        <Input />
      </Field>,
    );

    expect(screen.getByRole("textbox").hasAttribute("aria-invalid")).toBe(false);
  });

  it("marks the control invalid and alerts when there is an error", () => {
    render(
      <Field label="Email" error="Required.">
        <Input />
      </Field>,
    );

    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Required.");
  });

  it("conveys required to assistive technology, not only with a glyph", () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    );

    expect(screen.getByRole("textbox")).toHaveProperty("required", true);
    expect(screen.getByText("(required)")).toBeDefined();
  });

  it("lets a control work standalone, with no wiring", () => {
    render(<Input aria-label="Search" />);
    const input = screen.getByRole("textbox");

    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("lets a caller-supplied id win over the generated one", () => {
    render(
      <Field label="Email">
        <Input id="my-own-id" />
      </Field>,
    );

    expect(screen.getByRole("textbox").id).toBe("my-own-id");
  });

  it("wires a Textarea the same way", () => {
    render(
      <Field label="Notes" error="Too long.">
        <Textarea />
      </Field>,
    );

    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  });

  it("has no accessibility violations, valid or invalid", async () => {
    const { container: valid } = render(
      <Field label="Email" description="Hint.">
        <Input type="email" />
      </Field>,
    );
    await expectNoA11yViolations(valid);

    const { container: invalid } = render(
      <Field label="Name" error="Required." required>
        <Input />
      </Field>,
    );
    await expectNoA11yViolations(invalid);
  });
});
