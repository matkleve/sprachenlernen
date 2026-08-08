import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Field } from "./Field";
import { Select } from "./Select";

/** The named check for docs/specs/component/select.md. */

const options = (
  <>
    <option value="">Choose…</option>
    <option value="a">Alpha</option>
    <option value="b">Bravo</option>
  </>
);

describe("Select", () => {
  it("focuses when its Field label is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Team">
        <Select>{options}</Select>
      </Field>,
    );

    await user.click(screen.getByText("Team"));

    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });

  it("takes the invalid state from its Field", () => {
    render(
      <Field label="Team" error="Pick one.">
        <Select>{options}</Select>
      </Field>,
    );

    expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
  });

  it("works standalone with no wiring", () => {
    render(<Select aria-label="Team">{options}</Select>);

    expect(screen.getByRole("combobox").hasAttribute("aria-describedby")).toBe(false);
  });

  it("renders a real select with real options", async () => {
    // The point of the component: the platform picker, native typeahead and the
    // mobile wheel all come from this being a <select> and not a rebuilt menu.
    const user = userEvent.setup();
    render(<Select aria-label="Team">{options}</Select>);

    const select = screen.getByRole("combobox");
    expect(select.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option")).toHaveLength(3);

    await user.selectOptions(select, "b");
    expect((select as HTMLSelectElement).value).toBe("b");
  });

  it("keeps the drawn chevron out of the hit area", () => {
    // Without pointer-events-none the icon is a dead zone in the middle of the
    // control, and the click that lands on it does nothing.
    const { container } = render(<Select aria-label="Team">{options}</Select>);

    expect(container.querySelector("svg")?.getAttribute("class")).toContain(
      "pointer-events-none",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Field label="Team" description="Pick the owning team.">
        <Select>{options}</Select>
      </Field>,
    );

    await expectNoA11yViolations(container);
  });
});
