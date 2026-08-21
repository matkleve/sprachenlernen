/**
 * Contract: docs/specs/feature/exercise-runner.md
 *
 * The load-bearing assertion is the negative one: the closing step must not
 * offer an action the app does not perform.
 */
import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SummaryStep } from "@/features/exercise-runner/steps/SummaryStep";
import { NO_SESSION_FINDINGS, type SessionFindings } from "@/lib/exercise-runner";
import type { ExerciseStep } from "@/lib/exercise-runner/types";

const step: ExerciseStep = { id: "d1", type: "decide", component: "summary", config: {} };

function renderSummary(sessionFindings: SessionFindings, config: ExerciseStep["config"] = {}) {
  render(
    <SummaryStep
      step={{ ...step, config }}
      sessionFindings={sessionFindings}
      onDecline={vi.fn()}
      onSelectOffer={vi.fn()}
    />,
  );
}

describe("SummaryStep", () => {
  it("falls back to the static body when no check ran", () => {
    renderSummary(NO_SESSION_FINDINGS);

    expect(screen.getByText(en.exerciseRunner.summaryDefault)).toBeDefined();
  });

  it("reports the categories that came up, most frequent first", () => {
    renderSummary({
      checked: 3,
      clean: 1,
      unavailable: 0,
      byCategory: [
        { category: "agreement", count: 2 },
        { category: "spelling", count: 1 },
      ],
      words: ["el", "grandee"],
    });

    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items[0]).toContain(en.sentenceCheck.categoryAgreement);
    expect(items[1]).toContain(en.sentenceCheck.categorySpelling);
    expect(document.body.textContent).toContain("el, grandee");
  });

  it("still names what was examined rather than calling the sentences correct", () => {
    renderSummary({ checked: 2, clean: 2, unavailable: 0, byCategory: [], words: [] });

    expect(screen.getByText(en.exerciseRunner.sentenceCheckWhatWasChecked)).toBeDefined();
    expect(document.body.textContent).not.toMatch(/\bcorrect\b/i);
  });

  it("says when a check could not run", () => {
    renderSummary({ checked: 0, clean: 0, unavailable: 2, byCategory: [], words: [] });

    expect(document.body.textContent).toContain("could not be checked");
  });

  it("offers nothing it cannot do — only the terminal action", () => {
    renderSummary({
      checked: 2,
      clean: 0,
      unavailable: 0,
      byCategory: [{ category: "spelling", count: 2 }],
      words: ["grandee"],
    });

    // Selecting an offer is wired straight to "complete the step", so any extra
    // button here would claim an action that never happens.
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toBe(en.exerciseRunner.decline);
  });
});
