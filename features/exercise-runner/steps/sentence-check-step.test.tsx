/**
 * Contract: docs/specs/service/sentence-check.md
 *
 * The copy assertions are the point of this file. What the step is allowed to
 * say about a clean sentence is a product rule, not a wording preference —
 * "nothing found" names what was examined, "correct" would be a claim the
 * checker cannot support (STUDY-006).
 */
import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SentenceCheckStep } from "@/features/exercise-runner/steps/SentenceCheckStep";
import { EMPTY_STEP_ANSWER, type StepAnswer } from "@/lib/exercise-runner/types";
import type { SentenceCheckResult } from "@/lib/sentence-check";

vi.mock("@/features/exercise-runner/actions", () => ({
  checkSentenceAction: vi.fn(async () => ({
    status: "checked",
    tokens: ["Mi", "casa"],
    findings: [],
  })),
}));

const config = { word: "casa", lemma: "casa", gloss: "Haus" };

function answerWith(result: SentenceCheckResult, text = "Mi casa"): StepAnswer {
  return { ...EMPTY_STEP_ANSWER, text, check: { phase: "checked", result } };
}

function renderStep(answer: StepAnswer) {
  const onTextChange = vi.fn();
  const onCheckChange = vi.fn();
  render(
    <SentenceCheckStep
      config={config}
      answer={answer}
      onTextChange={onTextChange}
      onCheckChange={onCheckChange}
    />,
  );
  return { onTextChange, onCheckChange };
}

describe("SentenceCheckStep", () => {
  it("shows the target word and the check button before any check", () => {
    renderStep({ ...EMPTY_STEP_ANSWER, text: "Mi casa" });

    expect(screen.getByText("casa")).toBeDefined();
    expect(screen.getByRole("button", { name: en.exerciseRunner.sentenceCheckAction }));
  });

  it("cannot be checked while the field is empty", () => {
    renderStep(EMPTY_STEP_ANSWER);

    const button = screen.getByRole("button", {
      name: en.exerciseRunner.sentenceCheckAction,
    });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("runs the check and reports the result", async () => {
    const { onCheckChange } = renderStep({ ...EMPTY_STEP_ANSWER, text: "Mi casa" });

    await userEvent.click(
      screen.getByRole("button", { name: en.exerciseRunner.sentenceCheckAction }),
    );

    expect(onCheckChange).toHaveBeenCalledWith({ phase: "checking" });
    expect(onCheckChange).toHaveBeenCalledWith({
      phase: "checked",
      result: { status: "checked", tokens: ["Mi", "casa"], findings: [] },
    });
  });

  it("says nothing was found — never that the sentence is correct", () => {
    renderStep(answerWith({ status: "checked", tokens: ["Mi", "casa"], findings: [] }));

    expect(screen.getByText(en.exerciseRunner.sentenceCheckNoFindings)).toBeDefined();
    expect(screen.getByText(en.exerciseRunner.sentenceCheckWhatWasChecked)).toBeDefined();
    expect(document.body.textContent).not.toMatch(/\bcorrect\b/i);
  });

  it("marks the flagged word and explains it under the lines", () => {
    renderStep(
      answerWith(
        {
          status: "checked",
          tokens: ["el", "casa"],
          findings: [
            {
              tokenIndex: 0,
              category: "agreement",
              messageKey: "agreementGenderWithFix",
              messageValues: { word: "el", noun: "casa", suggestion: "la" },
              suggestion: "la",
            },
          ],
        },
        "el casa",
      ),
    );

    // "casa" is also the target word heading, so scope to the sentence line.
    const line = screen.getByText("el").parentElement!;
    expect(screen.getByText("el").className).toContain("text-danger");
    expect(
      [...line.children].find((child) => child.textContent === "casa")!.className,
    ).toContain("text-ink");
    expect(document.body.textContent).toContain(en.sentenceCheck.categoryAgreement);
    expect(document.body.textContent).toContain("«la»");
  });

  it("says so honestly when it could not check, rather than reporting nothing found", () => {
    renderStep(answerWith({ status: "unavailable", reason: "no-lexicon" }));

    expect(screen.getByText(en.exerciseRunner.sentenceCheckUnavailable)).toBeDefined();
    expect(screen.queryByText(en.exerciseRunner.sentenceCheckNoFindings)).toBeNull();
  });
});
