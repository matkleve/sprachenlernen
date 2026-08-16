import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { copy } from "./content";
import { WordsReviewCardHeader } from "./WordsReviewCardHeader";
import { wordsReviewGraphicAlt, wordsReviewGraphicSrc } from "./words-home-graphic";

describe("WordsReviewCardHeader", () => {
  it("shows the review label on the header overlay", () => {
    render(<WordsReviewCardHeader />);
    expect(screen.getByText(copy.reviewHeading)).toBeDefined();
  });

  it("uses the words review asset and decorative alt text", () => {
    render(<WordsReviewCardHeader />);
    const image = screen.getByRole("img", {
      name: wordsReviewGraphicAlt(copy.reviewHeading),
    });
    expect(image.getAttribute("src")).toContain(
      encodeURIComponent(wordsReviewGraphicSrc),
    );
  });

  it("keeps a fixed header height for visual parity with method cards", () => {
    const { container } = render(<WordsReviewCardHeader />);
    expect(container.firstElementChild?.className).toContain("h-20");
  });

  it("has no accessibility violations in isolation", async () => {
    const { container } = render(<WordsReviewCardHeader />);
    await expectNoA11yViolations(container);
  });
});
