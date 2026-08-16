import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Disclosure, DisclosureSummary } from "@/components/ui/Disclosure";

describe("Disclosure", () => {
  it("renders a semibold summary with a chevron indicator", () => {
    render(
      <Disclosure>
        <DisclosureSummary>More detail</DisclosureSummary>
        <p>Expanded body</p>
      </Disclosure>,
    );

    const summary = screen.getByText("More detail").closest("summary");
    expect(summary?.className).toContain("font-semibold");
    expect(summary?.querySelector("svg")).not.toBeNull();
  });

  it("marks the chevron for open-state rotation", async () => {
    const user = userEvent.setup();
    render(
      <Disclosure>
        <DisclosureSummary>Show plan</DisclosureSummary>
        <p>Plan details</p>
      </Disclosure>,
    );

    const details = screen.getByText("Show plan").closest("details");
    const chevron = details?.querySelector("svg");
    expect(chevron?.getAttribute("class")).toContain("group-open:rotate-180");

    await user.click(screen.getByText("Show plan"));

    expect(details?.hasAttribute("open")).toBe(true);
  });
});
