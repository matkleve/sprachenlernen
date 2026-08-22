import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PracticePrepList } from "@/features/exercise-runner/practice-surface/PracticePrepList";
import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";

describe("practice surface", () => {
  it("renders prep rows as full-width option buttons", () => {
    render(<PracticePrepList entries={[{ id: "a", label: "Keyboard ready" }]} />);

    const button = screen.getByRole("button", { name: "Keyboard ready" });
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("justify-start");
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps option buttons readable with multi-line label text", () => {
    render(
      <PracticePrepList
        entries={[
          {
            id: "target",
            label: "In deiner Zielsprache schreiben — nicht auf Deutsch",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "In deiner Zielsprache schreiben — nicht auf Deutsch",
      }),
    ).not.toBeNull();
  });

  it("toggles a prep row when the learner selects it", async () => {
    const user = userEvent.setup();
    render(
      <PracticePrepList entries={[{ id: "keyboard", label: "Keyboard ready" }]} />,
    );

    const button = screen.getByRole("button", { name: "Keyboard ready" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.className).toContain("border-line");

    await user.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.className).toContain("bg-accent");
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
