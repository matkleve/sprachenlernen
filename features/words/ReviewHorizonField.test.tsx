import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReviewHorizonField } from "@/features/words/ReviewHorizonField";
import { copy } from "@/features/words/content";
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

    expect(screen.getByText(copy.horizonExpand)).toBeDefined();
    expect(screen.queryByText(copy.horizonWeekLabel(1))).toBeNull();
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

    expect(screen.getByText(copy.horizonWeekLabel(1))).toBeDefined();
    expect(screen.getByText(copy.horizonReturnPlan)).toBeDefined();
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

    const { container } = render(
      <ReviewHorizonField horizon={horizon} display={display} now={now} />,
    );

    await user.click(screen.getByRole("button", { name: copy.horizonExpand }));

    expect(screen.getByText(copy.horizonWeekLabel(1))).toBeDefined();
    expect(screen.queryByText(/\bbacklog\b/i)).toBeNull();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });

  it("fits week and day drill-down without horizontal scroll regions", async () => {
    const user = userEvent.setup();
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

    expect(container.querySelector(".overflow-x-auto")).toBeNull();

    await user.click(
      screen.getByRole("button", { name: copy.horizonWeekAria(1, 21, 3) }),
    );

    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });
});
