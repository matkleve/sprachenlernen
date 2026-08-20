import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PracticePrepList } from "@/features/exercise-runner/practice-surface/PracticePrepList";
import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";

describe("practice surface", () => {
  it("renders prep rows without a row border and checkbox on the right", () => {
    const { container } = render(
      <PracticePrepList
        entries={[
          { id: "a", label: "Keyboard ready" },
          { id: "b", label: "Target language" },
        ]}
      />,
    );
    expect(screen.getByText("Keyboard ready")).toBeDefined();
    const row = container.querySelector("label");
    expect(row?.className).toContain("min-h-11");
    expect(row?.className).not.toContain("border-line-strong");
    expect(row?.className).not.toContain("shadow-soft");

    const text = screen.getByText("Keyboard ready");
    const marker = row?.querySelector("[aria-hidden]");
    expect(marker?.compareDocumentPosition(text)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
  });

  it("top-aligns the checkbox with multi-line label text", () => {
    const { container } = render(
      <PracticePrepList
        entries={[
          {
            id: "target",
            label: "In Ihrer Zielsprache schreiben — nicht auf Englisch",
          },
        ]}
      />,
    );

    const row = container.querySelector("label");
    expect(row?.className).toContain("items-start");
    const marker = row?.querySelector("[aria-hidden]");
    expect(marker?.className).toContain("self-start");
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
