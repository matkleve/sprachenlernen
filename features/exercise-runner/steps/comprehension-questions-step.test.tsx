import { renderWithIntlDe } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ComprehensionQuestionsStep } from "@/features/exercise-runner/steps/ComprehensionQuestionsStep";
import { comprehensionQuestionsForSource } from "@/lib/exercise-recipe/comprehension-questions";

describe("ComprehensionQuestionsStep i18n", () => {
  it("renders German UI for reflective fallback questions", () => {
    const questions = comprehensionQuestionsForSource("it-fixture-bar");
    renderWithIntlDe(<ComprehensionQuestionsStep config={{ questions }} />);

    expect(
      screen.getByText("Hast du den ganzen Text gelesen, ohne lange zu stoppen?"),
    ).toBeDefined();
    expect(screen.getByText("Ja, fast durchgehend")).toBeDefined();
    expect(screen.getByText("Konntest du der Hauptidee folgen?")).toBeDefined();
  });
});
