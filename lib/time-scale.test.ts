import { describe, expect, it } from "vitest";

import {
  DEFAULT_TIME_BUDGET,
  budgetFromStepIndex,
  parseTimeBudgetParam,
  snapMinutes,
  stepIndexFromBudget,
  timeBudgetToParam,
} from "@/lib/time-scale";

describe("time scale", () => {
  it("starts with dense low-minute steps", () => {
    expect(budgetFromStepIndex(0)).toBe(2);
    expect(budgetFromStepIndex(1)).toBe(3);
    expect(budgetFromStepIndex(6)).toBe(15);
  });

  it("reaches one day before endless", () => {
    const lastMinuteStep = budgetFromStepIndex(20);
    expect(lastMinuteStep).toBe(1440);
    expect(budgetFromStepIndex(21)).toBe("endless");
  });

  it("defaults to fifteen minutes", () => {
    expect(DEFAULT_TIME_BUDGET).toBe(15);
    expect(stepIndexFromBudget(15)).toBe(6);
  });

  it("round-trips through URL params", () => {
    expect(parseTimeBudgetParam("endless")).toBe("endless");
    expect(timeBudgetToParam("endless")).toBe("endless");
    expect(parseTimeBudgetParam("90")).toBe(90);
    expect(timeBudgetToParam(90)).toBe("90");
  });

  it("snaps legacy minute values to the nearest step", () => {
    expect(snapMinutes(37)).toBe(40);
    expect(parseTimeBudgetParam("37")).toBe(40);
  });

  it("treats values above one day as endless", () => {
    expect(parseTimeBudgetParam("2000")).toBe("endless");
  });
});
