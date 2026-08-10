import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { fitsMinutes, fitsPartialContext } from "@/lib/method-catalogue";
import { filterMethods, parseMenuFilter } from "@/lib/method-menu-filter";

const { catalogue } = loadMethodCatalogue();

describe("parseMenuFilter", () => {
  it("parses minutes and skill", () => {
    const filter = parseMenuFilter({ minutes: "15", skill: "reading" });
    expect(filter.timeBudget).toBe(15);
    expect(filter.skill).toBe("reading");
  });

  it("parses endless time budget", () => {
    const filter = parseMenuFilter({ minutes: "endless" });
    expect(filter.timeBudget).toBe("endless");
  });
});

describe("filterMethods", () => {
  it("filters by minutes", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ minutes: "2" }));
    const expected = catalogue!.entries
      .filter((e) => e.type === "method")
      .filter((m) => m.type === "method" && fitsMinutes(m, 2));
    expect(result.map((m) => m.id).sort()).toEqual(expected.map((m) => m.id).sort());
  });

  it("filters by energy low", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ energy: "low" }));
    expect(result.every((m) => m.intensity === 1)).toBe(true);
  });

  it("does not filter by time when budget is endless", () => {
    const all = catalogue!.entries.filter((e) => e.type === "method");
    const result = filterMethods(catalogue!, parseMenuFilter({ minutes: "endless" }));
    expect(result.length).toBe(all.length);
  });

  it("filters by refine hands=none", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ hands: "none" }));
    expect(
      result.every((m) => fitsPartialContext(m, { hands: "none" })),
    ).toBe(true);
  });
});
