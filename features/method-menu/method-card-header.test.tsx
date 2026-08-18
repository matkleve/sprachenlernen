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
    expect(container.firstElementChild?.className).toContain("h-32");
  });

  it("covers the card graphic without stretching (cover, top-aligned)", () => {
    const { container } = render(<MethodCardHeader section="listening" />);
    const image = container.querySelector("img");
    expect(image?.className).toContain("object-cover");
    expect(image?.className).toContain("object-top");
    expect(container.querySelector("[aria-hidden]")?.className).toContain("via-50%");
    expect(container.firstElementChild?.className).toContain("bg-section-listening-soft");
  });

  it("uses a scrim pocket and ink label on card headers for contrast", () => {
    render(<MethodCardHeader section="vocabulary" />);
    const label = screen.getByText(en.methodMenu.sections.vocabulary);
    expect(label.className).toContain("text-ink");
    expect(label.className).toContain("bg-surface/70");
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
