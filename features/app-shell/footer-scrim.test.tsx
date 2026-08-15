import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { FooterScrim } from "./FooterScrim";

describe("FooterScrim", () => {
  it("bleeds scrim to bottom-0 with a separate pill row", () => {
    const { container } = render(
      <FooterScrim>
        <nav aria-label="Test nav">pill</nav>
      </FooterScrim>,
    );

    const zone = container.querySelector(".shell-float-footer-scrim");
    expect(zone?.className).toContain("bottom-0");
    expect(zone?.className).toContain("fixed");
    expect(container.querySelector(".shell-float-nav-pill")).not.toBeNull();
    expect(container.querySelector(".footer-scrim-tint")).not.toBeNull();
  });
});
