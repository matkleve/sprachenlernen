import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { MethodCardHeader } from "./MethodCardHeader";
import { sectionGraphicAlt, sectionGraphicSrc } from "./section-graphic";

describe("MethodCardHeader", () => {
  it("shows the section label on the header overlay", () => {
    render(<MethodCardHeader section="listening" />);
    expect(screen.getByText(en.methodMenu.sections.listening)).toBeDefined();
  });

  it("uses the section asset and decorative alt text", () => {
    render(<MethodCardHeader section="listening" />);
    const image = screen.getByRole("img", {
      name: sectionGraphicAlt("listening", en.methodMenu.sections.listening),
    });
    expect(image.getAttribute("src")).toContain("method-section-listening.webp");
  });

  it("keeps a fixed header height for catalogue scanability", () => {
    const { container } = render(<MethodCardHeader section="reading" />);
    expect(container.firstElementChild?.className).toContain("h-20");
  });

  it("supports a taller hero variant for method detail", () => {
    const { container } = render(<MethodCardHeader section="reading" size="hero" />);
    expect(container.firstElementChild?.className).toContain("h-44");
  });

  it("has no accessibility violations in isolation", async () => {
    const { container } = render(<MethodCardHeader section="writing" />);
    await expectNoA11yViolations(container);
  });
});
