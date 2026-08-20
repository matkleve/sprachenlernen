import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PracticePrepList } from "@/features/exercise-runner/practice-surface/PracticePrepList";
import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";

describe("practice surface", () => {
  it("centers the checkbox with single-line prep copy", () => {
    const { container } = render(
      <PracticePrepList entries={[{ id: "a", label: "Keyboard ready" }]} />,
    );
    const row = container.querySelector("label");
    expect(row?.className).toContain("items-center");
    expect(row?.className).toContain("px-4");
    expect(screen.getByText("Keyboard ready").className).toContain("font-semibold");
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
