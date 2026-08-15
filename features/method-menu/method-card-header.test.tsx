import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { MethodCardHeader } from "./MethodCardHeader";
import { sections } from "./content";
import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

describe("MethodCardHeader", () => {
  it("shows the section label on the header overlay", () => {
    render(<MethodCardHeader section="listening" />);
    expect(screen.getByText(sections.listening)).toBeDefined();
  });

  it("uses the section asset and decorative alt text", () => {
    render(<MethodCardHeader section="listening" />);
    const image = screen.getByRole("img", {
      name: sectionGraphicAlt("listening", sections.listening),
    });
    expect(image.getAttribute("src")).toContain(
      encodeURIComponent(sectionGraphicSrc.listening),
    );
  });

  it("keeps a fixed header height for catalogue scanability", () => {
    const { container } = render(<MethodCardHeader section="reading" />);
    expect(container.firstElementChild?.className).toContain("h-20");
  });

  it("has no accessibility violations in isolation", async () => {
    const { container } = render(<MethodCardHeader section="writing" />);
    await expectNoA11yViolations(container);
  });
});
