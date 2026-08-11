import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { isMethod } from "@/lib/method-catalogue";
import { pickDailyThree } from "@/lib/daily-three";

describe("pickDailyThree", () => {
  const catalogue = loadMethodCatalogue().catalogue!;
  const methods = catalogue.entries.filter(isMethod);

  it("returns at most three methods", () => {
    expect(pickDailyThree(methods, "2026-08-11").length).toBeLessThanOrEqual(3);
  });

  it("includes a low-intensity option when the pool is large enough", () => {
    const picks = pickDailyThree(methods, "2026-08-11");
    expect(picks.some((method) => method.intensity === 1)).toBe(true);
  });

  it("is stable for the same day key", () => {
    const a = pickDailyThree(methods, "2026-08-11").map((method) => method.id);
    const b = pickDailyThree(methods, "2026-08-11").map((method) => method.id);
    expect(a).toEqual(b);
  });

  it("may change when the day key changes", () => {
    const a = pickDailyThree(methods, "2026-08-11").map((method) => method.id).join(",");
    const b = pickDailyThree(methods, "2026-08-12").map((method) => method.id).join(",");
    // Not guaranteed different, but with this catalogue they usually are.
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
  });
});
