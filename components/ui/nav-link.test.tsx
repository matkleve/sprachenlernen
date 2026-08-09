import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { NavLink } from "./NavLink";

/**
 * The named check for docs/specs/component/nav-link.md. One test per
 * acceptance criterion.
 */

const link = () => screen.getByRole("link");

describe("NavLink", () => {
  it("announces the current page when it is current", () => {
    render(
      <NavLink href="/methods" current>
        Methods
      </NavLink>,
    );

    expect(link().getAttribute("aria-current")).toBe("page");
  });

  it("carries no aria-current at all when it is not — absent, not false", () => {
    // `aria-current="false"` is valid ARIA and means "not current", but it is
    // also what a screen reader has to parse to find that out. Absent is the
    // form the rest of this codebase uses for a negative (Field's aria-invalid).
    render(<NavLink href="/words">Words</NavLink>);

    expect(link().hasAttribute("aria-current")).toBe(false);
  });

  it("is an anchor with the href it was given", () => {
    render(<NavLink href="/progress">Progress</NavLink>);

    expect(link().tagName).toBe("A");
    expect(link().getAttribute("href")).toBe("/progress");
  });

  it("lets the caller's class win over its own conflicting one", () => {
    // The whole reason cn() exists (lib/utils.ts). If tailwind-merge did not
    // know `rounded-pill` is a radius, both classes would survive and which
    // one won would be down to CSS source order.
    render(
      <NavLink href="/methods" className="rounded-none">
        Methods
      </NavLink>,
    );

    expect(link().className).toContain("rounded-none");
    expect(link().className).not.toContain("rounded-pill");
  });

  it("has a focus ring, and hover and active treatments that differ from rest", () => {
    render(<NavLink href="/methods">Methods</NavLink>);

    const className = link().className;
    expect(className).toContain("focus-visible:ring-2");
    expect(className).toMatch(/hover:/);
    expect(className).toContain("active:scale-");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <nav aria-label="Destinations">
        <NavLink href="/methods" current>
          Methods
        </NavLink>
        <NavLink href="/words">Words</NavLink>
      </nav>,
    );

    await expectNoA11yViolations(container);
  });
});
