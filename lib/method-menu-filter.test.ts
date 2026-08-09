import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { fitsMinutes, fitsPartialContext } from "@/lib/method-catalogue";
import { filterMethods, parseMenuFilter, applySearchParamUpdates } from "@/lib/method-menu-filter";

const { catalogue } = loadMethodCatalogue();

describe("parseMenuFilter", () => {
  it("parses minutes and skill", () => {
    const filter = parseMenuFilter({ minutes: "15", skill: "reading" });
    expect(filter.minutes).toBe(15);
    expect(filter.skill).toBe("reading");
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

  it("filters by refine hands=none", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ hands: "none" }));
    expect(
      result.every((m) => fitsPartialContext(m, { hands: "none" })),
    ).toBe(true);
  });
});

describe("applySearchParamUpdates", () => {
  it("merges updates without dropping unrelated params", () => {
    const next = applySearchParamUpdates(
      { minutes: "15", skill: "reading" },
      { energy: "low" },
    );
    expect(next).toEqual({ minutes: "15", skill: "reading", energy: "low" });
  });

  it("clears a param when the update value is undefined", () => {
    const next = applySearchParamUpdates({ minutes: "15", skill: "reading" }, { skill: undefined });
    expect(next).toEqual({ minutes: "15" });
  });
});
