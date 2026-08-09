import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressReport } from "@/features/progress/ProgressReport";
import { copy, statusNames } from "@/features/progress/content";
import { hoursPerYear, yearsToReach } from "@/lib/dose-band";
import { readLevel } from "@/lib/level-model";
import { rebuild, type Review } from "@/lib/scheduler";

/**
 * Contract: docs/specs/page/progress.md
 */

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 9);

function reviewedTask(id: string, grades: Review["grade"][]) {
  const reviews: Review[] = grades.map((grade, index) => ({
    at: now - (grades.length - index) * 3 * DAY,
    grade,
  }));
  return rebuild(id, `word:${id}`, reviews).task;
}

const empty = readLevel([], now);
const withHistory = readLevel(
  [reviewedTask("t1", ["good", "good", "good"]), reviewedTask("t2", ["hard", "good"])],
  now,
);

/** Leaves only — `textContent` welds siblings together (docs/TRAPS.md). */
function leafText(container: HTMLElement): string {
  return Array.from(container.querySelectorAll("*"))
    .filter((element) => element.children.length === 0)
    .map((element) => element.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" | ");
}

describe("ProgressReport", () => {
  it("shows all four skills as not measured when nothing has been reviewed", () => {
    render(<ProgressReport reading={empty} />);

    expect(screen.getAllByText(statusNames["not-measured"])).toHaveLength(4);
    expect(screen.getByText(copy.emptyState)).toBeDefined();
  });

  it("still shows all four as not measured once there is review history", () => {
    render(<ProgressReport reading={withHistory} />);

    expect(screen.getAllByText(statusNames["not-measured"])).toHaveLength(4);
  });

  it("withholds the overall level and says which rule withholds it", () => {
    render(<ProgressReport reading={empty} />);

    expect(screen.getByText(copy.overallWithheld)).toBeDefined();
  });

  it("shows recall stability as a value with its derivation, and no CEFR level", () => {
    render(<ProgressReport reading={withHistory} />);

    const stability = withHistory.signals.find((signal) => signal.id === "recall-stability")!;
    expect(screen.getByText(copy.stabilityValue(stability.value!, stability.taskCount))).toBeDefined();

    // study/03 § What a signal may and may not claim: a signal rendered as
    // "Recall stability: A2" invents a level the model does not define.
    //
    // Scoped to the signals table, not the page. Written page-wide it went red
    // the moment the dose band arrived, because that table's rows are *called*
    // A1…B2 — and those are levels being costed, not signals being labelled.
    // A page-wide ban on the letters would have been a rule nobody stated.
    const signalsTable = screen.getByRole("region", { name: copy.signalsCaption });
    expect(leafText(signalsTable)).not.toMatch(/\b[ABC][12](\.\d)?\b/);
  });

  it("shows the dose band with its borrowed label, and no numerator", () => {
    render(<ProgressReport reading={withHistory} />);

    // The band is the point of F184, and the caveat is question 19's answer —
    // a figure from an uncalibrated table shown without it is the claim the
    // study spends C4 refusing to make.
    expect(screen.getByText(copy.doseHours(350, 400))).toBeDefined();
    expect(screen.getByText(copy.doseBorrowed)).toBeDefined();
    expect(screen.getByText(copy.doseNoNumerator)).toBeDefined();
  });

  it("reproduces the chapter's arithmetic rather than inventing a second one", () => {
    render(<ProgressReport reading={empty} />);

    expect(screen.getByText(copy.doseHabit(hoursPerYear(15)))).toBeDefined();

    const b1 = yearsToReach("B1", 15)!;
    expect(screen.getByText(copy.doseYears(b1.minYears, b1.maxYears))).toBeDefined();
  });

  it("presents no count that can only rise as progress", () => {
    // study/25 C3. Streak, XP and a cards-reviewed total are the three shapes
    // this page must never grow, and they are cheap to add by accident the
    // moment somebody wants it to feel rewarding.
    for (const reading of [empty, withHistory]) {
      const { container, unmount } = render(<ProgressReport reading={reading} />);
      expect(leafText(container)).not.toMatch(/\bstreak\b|\bXP\b|\bpoints\b|\bday streak\b/i);
      unmount();
    }
  });
});
