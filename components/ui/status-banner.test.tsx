import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { StatusBanner } from "./StatusBanner";

describe("SPEC-component-status-banner", () => {
  it("announces success copy with status semantics", () => {
    render(
      <StatusBanner
        variant="success"
        title="Report received."
        body="We will not schedule this card again after today."
      />,
    );

    const banner = screen.getByRole("status");
    expect(banner.textContent).toContain("Report received.");
    expect(banner.textContent).toContain("We will not schedule this card again after today.");
    expect(banner.className).toContain("bg-success-soft");
  });

  it("omits the body line when none is provided", () => {
    render(<StatusBanner variant="info" title="Saved." />);

    expect(screen.getByRole("status").textContent).toBe("Saved.");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <StatusBanner variant="success" title="Report received." body="Done." />,
    );
    await expectNoA11yViolations(container);
  });
});
