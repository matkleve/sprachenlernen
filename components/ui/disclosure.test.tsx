import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Disclosure,
  disclosureShellClass,
  DisclosurePanel,
  DisclosureSummary,
} from "@/components/ui/Disclosure";

describe("Disclosure", () => {
  it("renders a semibold summary with a chevron indicator", () => {
    render(
      <Disclosure>
        <DisclosureSummary>More detail</DisclosureSummary>
        <DisclosurePanel>
          <p>Expanded body</p>
        </DisclosurePanel>
      </Disclosure>,
    );

    const summary = screen.getByText("More detail").closest("summary");
    expect(summary?.className).toContain("font-semibold");
    expect(summary?.querySelector("svg")).not.toBeNull();
  });

  it("applies shell-level press feedback classes", () => {
    expect(disclosureShellClass).toContain("[&:has(summary:active)]:scale-[0.98]");
    expect(disclosureShellClass).toContain("bg-surface-raised");
    expect(disclosureShellClass).toContain("shadow-soft");
  });

  it("wraps panel content in animated grid rows", () => {
    render(
      <Disclosure>
        <DisclosureSummary>Show plan</DisclosureSummary>
        <DisclosurePanel>
          <p>Plan details</p>
        </DisclosurePanel>
      </Disclosure>,
    );

    const panel = screen.getByText("Plan details").parentElement?.parentElement;
    expect(panel?.className).toContain("grid-rows-[0fr]");
    expect(panel?.className).toContain("group-open:grid-rows-[1fr]");
  });

  it("marks the chevron for open-state rotation", async () => {
    const user = userEvent.setup();
    render(
      <Disclosure>
        <DisclosureSummary>Show plan</DisclosureSummary>
        <DisclosurePanel>
          <p>Plan details</p>
        </DisclosurePanel>
      </Disclosure>,
    );

    const details = screen.getByText("Show plan").closest("details");
    const chevron = details?.querySelector("svg");
    expect(chevron?.getAttribute("class")).toContain("group-open:rotate-180");

    await user.click(screen.getByText("Show plan"));

    expect(details?.hasAttribute("open")).toBe(true);
  });
});
