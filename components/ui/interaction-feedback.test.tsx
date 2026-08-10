import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/Button";
import { navLinkVariants } from "@/components/ui/NavLink";

/**
 * Contract smoke tests for SPEC-feature-interaction-feedback (draft).
 * Pending-state behavior is added in the implementation PR.
 */
describe("interaction-feedback contract", () => {
  it("Button includes press (active) feedback classes", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button").className).toContain("active:scale");
  });

  it("NavLink variants include press (active) feedback classes", () => {
    expect(navLinkVariants()).toContain("active:scale");
  });
});
