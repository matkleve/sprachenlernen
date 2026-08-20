import { renderWithIntl as render, renderWithIntlDe } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ExerciseRunner } from "@/features/exercise-runner/ExerciseRunner";
import { ChecklistStep } from "@/features/exercise-runner/steps/ChecklistStep";
import { FIXTURE_EXERCISE_RECIPE } from "@/lib/exercise-runner/fixture-recipe";

describe("ExerciseRunner", () => {
  it("renders step 1 and progress for fixture recipe", () => {
    render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    expect(screen.getAllByText("Before you start").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
  });

  it("navigates forward without marking prior step done", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Hear sentence 1 and write it down.")).toBeDefined();
    expect(screen.getByText(/Step 2 of 6/)).toBeDefined();
  });

  it("completes decide via decline", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    const next = screen.getByRole("button", { name: "Next step" });
    for (let i = 0; i < 5; i += 1) {
      await user.click(next);
    }

    await user.click(screen.getByRole("button", { name: "Not now — done" }));
    expect(screen.getByText("Exercise complete")).toBeDefined();
  });

  it("applies practice-fit-frame on the runner root", () => {
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    expect(container.querySelector(".practice-fit-frame")).not.toBeNull();
  });

  it("uses overflow-hidden body zone on short-profile steps", () => {
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    expect(container.querySelector(".min-h-0.flex-1.overflow-hidden.p-1")).not.toBeNull();
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("shrink-0");
  });

  it("scrolls the body zone only on reading-profile steps", () => {
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Extensive reading"
        section="reading"
        recipe={{
          methodId: "extensive-reading",
          steps: [
            {
              id: "read",
              type: "do",
              component: "text-display",
              config: { text: "Long passage." },
            },
          ],
        }}
      />,
    );

    expect(container.querySelector(".min-h-0.flex-1.overflow-y-auto.p-1")).not.toBeNull();
  });

  it("colors the active footer segment with primary on step 1", () => {
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    const footerBar = container.querySelector("footer [role=progressbar]");
    const firstSegment = footerBar?.children[0];
    expect(firstSegment?.className).toContain("bg-accent");
    expect(firstSegment?.className).not.toContain("bg-accent-soft");
  });

  it("marks done and active segments distinctly after navigating forward", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));

    const footerBar = container.querySelector("footer [role=progressbar]");
    expect(footerBar?.children[0]?.className).toContain("bg-accent-soft");
    expect(footerBar?.children[1]?.className).toContain("bg-accent");
  });

  it("renders segmented step progress in the footer above Continue", () => {
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    const footer = container.querySelector("footer");
    const progressbar = footer?.querySelector("[role=progressbar]");
    expect(progressbar).not.toBeNull();
    expect(progressbar?.children.length).toBe(FIXTURE_EXERCISE_RECIPE.steps.length);
    expect(footer?.textContent).toContain("Step 1 of 6");

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(footer?.contains(continueButton)).toBe(true);
    expect(progressbar?.compareDocumentPosition(continueButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders footer controls on canvas without a surface panel", () => {
    const { container } = render(
      <ExerciseRunner
        sectionLabel="Methods"
        methodName="Partial dictation"
        section="listening"
        recipe={FIXTURE_EXERCISE_RECIPE}
      />,
    );

    const footerPanel = container.querySelector("footer .border-t");
    expect(footerPanel?.className).toContain("border-line");
    expect(footerPanel?.className).not.toContain("bg-surface");
    expect(screen.getByRole("button", { name: "Continue" }).className).toContain("w-auto");
  });
});

describe("ChecklistStep i18n", () => {
  it("renders German prepare copy from recipe itemKeys", () => {
    renderWithIntlDe(
      <ChecklistStep
        step={{
          id: "prepare-1",
          type: "prepare",
          component: "checklist",
          config: {
            introKey: "introBuildASentence",
            itemKeys: ["prepareItemKeyboard", "prepareItemTargetLang"],
          },
        }}
      />,
    );

    expect(screen.getByText(/Stift und Papier oder Tastatur/)).toBeDefined();
    expect(screen.getByText(/In Ihrer Zielsprache schreiben/)).toBeDefined();
    expect(screen.queryByText(/Pen and paper or keyboard/)).toBeNull();
  });
});
