import { describe, expect, it } from "vitest";

import {
  practiceMobileBodyBudgetRem,
  prepareChecklistFitsBudget,
  prepareChecklistFitsMobileBudget,
  PRACTICE_FRAME_CHROME_REM,
  typicalMobileBodyBudgetRem,
} from "@/lib/exercise-runner/frame-budget";

describe("frame-budget", () => {
  it("subtracts mobile runner chrome from session height", () => {
    const session = 40;
    const expected =
      session -
      PRACTICE_FRAME_CHROME_REM.mobileHeader -
      PRACTICE_FRAME_CHROME_REM.mobileFooter -
      PRACTICE_FRAME_CHROME_REM.mobileGaps;
    expect(practiceMobileBodyBudgetRem(session)).toBe(expected);
  });

  it("typical phone leaves enough room for two prep rows", () => {
    expect(typicalMobileBodyBudgetRem()).toBeGreaterThan(20);
    expect(prepareChecklistFitsMobileBudget(2)).toBe(true);
  });

  it("flags three prep rows as tight on a small body budget", () => {
    const tightBody = 12;
    expect(prepareChecklistFitsBudget(tightBody, 3, 4)).toBe(false);
    expect(prepareChecklistFitsBudget(tightBody, 2)).toBe(true);
  });
});
