import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { WordsReviewCardHeader } from "./WordsReviewCardHeader";
import { wordsReviewGraphicAlt, wordsReviewGraphicSrc } from "./words-home-graphic";

describe("WordsReviewCardHeader", () => {
  it("shows the vocabulary label on the header overlay", async () => {
    render(await WordsReviewCardHeader());
    expect(screen.getByText(en.words.reviewCardHeaderLabel)).toBeDefined();
  });

  it("uses the words review asset and decorative alt text", async () => {
    render(await WordsReviewCardHeader());
    const image = screen.getByRole("img", {
      name: wordsReviewGraphicAlt(en.words.reviewCardHeaderLabel),
    });
    expect(image.getAttribute("src")).toContain(wordsReviewGraphicSrc);
  });

  it("keeps a fixed header height for visual parity with method cards", async () => {
    const { container } = render(await WordsReviewCardHeader());
    expect(container.firstElementChild?.className).toContain("h-20");
  });

  it("has no accessibility violations in isolation", async () => {
    const { container } = render(await WordsReviewCardHeader());
    await expectNoA11yViolations(container);
  });
});
