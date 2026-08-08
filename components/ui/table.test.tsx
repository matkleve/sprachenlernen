import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Table, Td, Th } from "./Table";

/** The named check for docs/specs/component/table.md. */

function Example({ showCaption = true }: { showCaption?: boolean }) {
  return (
    <Table caption="Open invoices" showCaption={showCaption}>
      <thead>
        <tr>
          <Th scope="col">Invoice</Th>
          <Th scope="col">Amount</Th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <Th scope="row">INV-001</Th>
          <Td>€120</Td>
        </tr>
      </tbody>
    </Table>
  );
}

describe("Table", () => {
  it("renders a real table with a caption", () => {
    const { container } = render(<Example />);

    expect(screen.getByRole("table")).toBeDefined();
    expect(container.querySelector("caption")?.textContent).toBe("Open invoices");
  });

  it("keeps the caption in the accessibility tree when visually hidden", () => {
    // Hidden is fine; absent is not. It is the only orientation a non-visual
    // user gets about what the table lists.
    const { container } = render(<Example showCaption={false} />);
    const caption = container.querySelector("caption")!;

    expect(caption.textContent).toBe("Open invoices");
    expect(caption.className).toContain("sr-only");
  });

  it("gives every header a scope", () => {
    // Without scope a screen reader reads a flat stream of values and the user
    // has to remember the column order themselves.
    const { container } = render(<Example />);

    const headers = [...container.querySelectorAll("th")];
    expect(headers).toHaveLength(3);
    for (const header of headers) {
      expect(header.getAttribute("scope")).toMatch(/^(col|row)$/);
    }

    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("rowheader")).toHaveLength(1);
  });

  it("makes the scroll region focusable and labelled", () => {
    // A scrollable box only a mouse can pan is a WCAG failure, not a nicety.
    render(<Example />);
    const region = screen.getByRole("region", { name: "Open invoices" });

    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.className).toContain("overflow-x-auto");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);
  });
});
