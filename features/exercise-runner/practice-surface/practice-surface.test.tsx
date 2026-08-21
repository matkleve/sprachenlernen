import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PracticePrepList } from "@/features/exercise-runner/practice-surface/PracticePrepList";
import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";

describe("practice surface", () => {
  it("renders prep rows with horizontal inset borders and checkbox on the right", () => {
    const { container } = render(
      <PracticePrepList entries={[{ id: "a", label: "Keyboard ready" }]} />,
    );
    const row = container.querySelector("label");
    expect(row?.className).toContain("min-h-11");
    expect(row?.className).toContain("items-center");
    expect(row?.className).toContain("px-4");
    expect(row?.className).toContain("bg-surface");
    expect(row?.className).toContain("border-x");
    expect(row?.className).toContain("border-line-strong");

    const text = screen.getByText("Keyboard ready");
    expect(text.className).toContain("font-semibold");
    const marker = row?.querySelector("[aria-hidden]");
    expect(marker?.compareDocumentPosition(text)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
  });

  it("keeps the checkbox vertically centered with multi-line label text", () => {
    const { container } = render(
      <PracticePrepList
        entries={[
          {
            id: "target",
            label: "In deiner Zielsprache schreiben — nicht auf Deutsch",
          },
        ]}
      />,
    );

    const row = container.querySelector("label");
    expect(row?.className).toContain("items-center");
  });

  it("toggles a prep row when the learner checks it", async () => {
    const user = userEvent.setup();
    render(
      <PracticePrepList entries={[{ id: "keyboard", label: "Keyboard ready" }]} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Keyboard ready" });
    expect((checkbox as HTMLInputElement).checked).toBe(false);

    await user.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    const checkedRow = checkbox.closest("label");
    expect(checkedRow?.className).toContain("bg-accent-soft");
    expect(checkedRow?.className).toContain("border-x");
    expect(checkedRow?.className).toContain("border-line");
  });

  it("wraps children at task density", () => {
    const { container } = render(
      <PracticeSurface>
        <p>Prompt</p>
      </PracticeSurface>,
    );
    expect(container.querySelector(".practice-surface")).not.toBeNull();
  });
});
