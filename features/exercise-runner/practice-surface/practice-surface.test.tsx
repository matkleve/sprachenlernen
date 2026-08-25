import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PracticePrepList } from "@/features/exercise-runner/practice-surface/PracticePrepList";
import { PracticeSurface } from "@/features/exercise-runner/practice-surface/PracticeSurface";

describe("practice surface", () => {
  it("renders prep rows as static requirement text", () => {
    const { container } = render(
      <PracticePrepList entries={[{ id: "a", label: "Keyboard ready" }]} />,
    );

    expect(screen.getByText("Keyboard ready")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Keyboard ready" })).toBeNull();

    const row = container.querySelector("li");
    expect(row?.className).toContain("border-x");
    expect(row?.className).toContain("border-line-strong");
    expect(row?.className).toContain("font-semibold");
  });

  it("keeps multi-line requirement text readable", () => {
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

    expect(screen.getByText("In deiner Zielsprache schreiben — nicht auf Deutsch")).not.toBeNull();
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
