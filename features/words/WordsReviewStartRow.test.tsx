import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WordsReviewStartRow } from "@/features/words/WordsReviewStartRow";

describe("WordsReviewStartRow", () => {
  it("renders the primary start link and an icon-only forms link", () => {
    render(
      <WordsReviewStartRow
        startHref="/words/review?method=srs-session&deck=meaning"
        startLabel={en.words.reviewStartAction}
        formsHref="/words/review?method=srs-session&deck=form"
        formsLabel={en.words.reviewFormsIconLabel}
      />,
    );

    expect(screen.getByRole("link", { name: en.words.reviewStartAction }).getAttribute("href")).toContain(
      "deck=meaning",
    );
    expect(screen.getByRole("link", { name: en.words.reviewFormsIconLabel }).getAttribute("href")).toContain(
      "deck=form",
    );
  });

  it("omits the forms icon when forms practice is unavailable", () => {
    render(
      <WordsReviewStartRow
        startHref="/words/review?method=srs-session&deck=meaning"
        startLabel={en.words.reviewStartAction}
      />,
    );

    expect(screen.getByRole("link", { name: en.words.reviewStartAction })).toBeDefined();
    expect(screen.queryByRole("link", { name: en.words.reviewFormsIconLabel })).toBeNull();
  });
});
