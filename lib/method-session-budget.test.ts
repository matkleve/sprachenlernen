import { describe, expect, it } from "vitest";

import {
  appendBudgetMinutesParam,
  resolveSessionBudgetMinutes,
} from "@/lib/method-session-budget";

describe("resolveSessionBudgetMinutes", () => {
  it("returns catalogue min when minutes param is missing", () => {
    expect(resolveSessionBudgetMinutes([8, 15, 20])).toBe(8);
  });

  it("clamps requested minutes into catalogue range", () => {
    expect(resolveSessionBudgetMinutes([8, 15, 20], "12")).toBe(12);
    expect(resolveSessionBudgetMinutes([8, 15, 20], "25")).toBe(20);
    expect(resolveSessionBudgetMinutes([8, 15, 20], "5")).toBe(8);
  });

  it("returns min when endless is requested", () => {
    expect(resolveSessionBudgetMinutes([8, 15, 20], "endless")).toBe(8);
  });

  it("returns undefined when catalogue has no durations", () => {
    expect(resolveSessionBudgetMinutes(null)).toBeUndefined();
    expect(resolveSessionBudgetMinutes([])).toBeUndefined();
  });
});

describe("appendBudgetMinutesParam", () => {
  it("adds minutes when budget is defined", () => {
    const params = new URLSearchParams({ method: "partial-dictation" });
    appendBudgetMinutesParam(params, 15);
    expect(params.get("minutes")).toBe("15");
  });

  it("leaves params unchanged when budget is undefined", () => {
    const params = new URLSearchParams({ method: "partial-dictation" });
    appendBudgetMinutesParam(params, undefined);
    expect(params.has("minutes")).toBe(false);
  });
});
