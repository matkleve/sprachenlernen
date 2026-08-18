import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReviewHorizonField } from "@/features/words/ReviewHorizonField";
import { buildHorizonDisplay } from "@/lib/review-horizon";
import { HORIZON_DAYS } from "@/lib/vocabulary-snapshot";

const now = Date.UTC(2026, 7, 12);

const horizon = Array.from({ length: HORIZON_DAYS }, (_, dayOffset) => ({
  dayOffset,
  count: dayOffset < 7 ? 3 : 0,
}));

describe("ReviewHorizonField", () => {
  it("starts collapsed for routine learners", () => {
    const reviewDays = [
      now - 30 * 86_400_000,
      now - 86_400_000,
      now - 2 * 86_400_000,
      now - 3 * 86_400_000,
      now - 4 * 86_400_000,
      now - 5 * 86_400_000,
    ];
    const display = buildHorizonDisplay(
      horizon,
      now,
      {
        reviewTimestamps: reviewDays,
        firstReviewByTaskId: new Map([["t1", now - 30 * 86_400_000]]),
      },
      [],
    );

    render(<ReviewHorizonField horizon={horizon} display={display} now={now} />);

    expect(screen.getByText(en.words.horizonExpand)).toBeDefined();
    expect(screen.queryByText(formatMessage(en.words.horizonWeekLabel, { week: 1 }))).toBeNull();
  });

  it("starts expanded after a gap and shows week columns", () => {
    const display = buildHorizonDisplay(
      horizon,
      now,
      {
        reviewTimestamps: [now - 10 * 86_400_000],
        firstReviewByTaskId: new Map([["t1", now - 10 * 86_400_000]]),
      },
      [],
    );

    render(<ReviewHorizonField horizon={horizon} display={display} now={now} />);

    expect(screen.getByText(formatMessage(en.words.horizonWeekLabel, { week: 1 }))).toBeDefined();
    expect(screen.getByText(en.words.horizonReturnPlan)).toBeDefined();
  });

  it("expands when the learner asks", async () => {
    const user = userEvent.setup();
    const reviewDays = [
      now - 30 * 86_400_000,
      now - 86_400_000,
      now - 2 * 86_400_000,
      now - 3 * 86_400_000,
      now - 4 * 86_400_000,
      now - 5 * 86_400_000,
    ];
    const display = buildHorizonDisplay(
      horizon,
      now,
      {
        reviewTimestamps: reviewDays,
        firstReviewByTaskId: new Map([["t1", now - 30 * 86_400_000]]),
      },
      [],
    );

    render(<ReviewHorizonField horizon={horizon} display={display} now={now} />);

    await user.click(screen.getByRole("button", { name: en.words.horizonExpand }));

    expect(screen.getByText(formatMessage(en.words.horizonWeekLabel, { week: 1 }))).toBeDefined();
    expect(screen.queryByText(/\bbacklog\b/i)).toBeNull();
  });

  it("rounds the per-day average in week copy", () => {
    const unevenHorizon = Array.from({ length: HORIZON_DAYS }, (_, dayOffset) => ({
      dayOffset,
      count: dayOffset < 7 ? (dayOffset === 0 ? 11 : 0) : 0,
    }));
    const display = buildHorizonDisplay(
      unevenHorizon,
      now,
      {
        reviewTimestamps: [now - 10 * 86_400_000],
        firstReviewByTaskId: new Map([["t1", now - 10 * 86_400_000]]),
      },
      [],
    );

    render(<ReviewHorizonField horizon={unevenHorizon} display={display} now={now} />);

    expect(screen.getByText("~2/day")).toBeDefined();
    expect(screen.queryByText(/1\.57/)).toBeNull();
  });

  it("renders a fixed tile grid instead of growing bar stacks", () => {
    const display = buildHorizonDisplay(
      horizon,
      now,
      {
        reviewTimestamps: [now - 10 * 86_400_000],
        firstReviewByTaskId: new Map([["t1", now - 10 * 86_400_000]]),
      },
      [],
    );

    const { container } = render(
      <ReviewHorizonField horizon={horizon} display={display} now={now} />,
    );

    const grids = container.querySelectorAll('[style*="grid-template-columns"]');
    expect(grids.length).toBeGreaterThan(0);
  });
});
