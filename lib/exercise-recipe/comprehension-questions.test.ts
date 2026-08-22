/**
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { describe, expect, it } from "vitest";

import { comprehensionQuestionsForSource } from "@/lib/exercise-recipe/comprehension-questions";

describe("comprehensionQuestionsForSource", () => {
  it("returns fixture-specific questions for catalogue sources", () => {
    const questions = comprehensionQuestionsForSource("wikinews-es-3516");
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions[0]?.correctOptionId).toBeTruthy();
  });

  it("falls back to reflective questions for unknown sources", () => {
    const questions = comprehensionQuestionsForSource("unknown-source");
    expect(questions.length).toBe(2);
    expect(questions[0]?.correctOptionId).toBeUndefined();
    expect(questions[0]?.promptKey).toBe("comprehensionReadWholePrompt");
    expect(questions[0]?.options[0]?.labelKey).toBe("comprehensionReadWholeYes");
  });
});
