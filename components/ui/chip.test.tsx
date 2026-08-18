import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders children", () => {
    render(<Chip>15 min</Chip>);
    expect(screen.getByText("15 min").tagName).toBe("SPAN");
  });

  it("applies accent tone", () => {
    render(<Chip tone="accent">Evidence A</Chip>);
    expect(screen.getByText("Evidence A").className).toContain("bg-accent-soft");
  });

  it("applies selected tone", () => {
    render(<Chip tone="selected">Active</Chip>);
    const chip = screen.getByText("Active");
    expect(chip.className).toContain("bg-accent");
    expect(chip.className).toContain("text-accent-ink");
  });

  it("applies card size for catalogue chips", () => {
    render(<Chip size="card">20–45 Min.</Chip>);
    const chip = screen.getByText("20–45 Min.");
    expect(chip.className).toContain("text-sm");
    expect(chip.className).toContain("min-h-8");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Chip>open-ended</Chip>);
    await expectNoA11yViolations(container);
  });
});
